import {
	type APIRequestContext,
	type Browser,
	type BrowserContext,
	expect,
	type Page,
	type TestInfo,
	test,
} from "@playwright/test";
import { COLLAB_TOKEN } from "../playwright.config";

/**
 * TOL-17: two windows on one live note see each other: an avatar in the note's bar and the
 * other's caret with its name. A window that switches note, goes offline or closes is gone
 * from the other within 5 s.
 */

const AUTH = { authorization: `Bearer ${COLLAB_TOKEN}` };
const LINE = "A line to stand on.";
/** The card's promise: presence clears this fast once a window has left. */
const LEAVE_MS = 5_000;
/** Joining waits on opening the note and its socket; the box may be busy. */
const JOIN_MS = 15_000;

interface SeededNote {
	path: string;
	title: string;
}

async function createNote(
	request: APIRequestContext,
	path: string,
	content: string,
): Promise<void> {
	const response = await request.put(`/v1/files/${path}`, {
		headers: { ...AUTH, "if-none-match": "*" },
		data: content,
	});
	expect(response.status()).toBe(201);
}

/** Deletes a note this test made, so the shared vault's note list stays as the other specs expect. */
async function deleteNote(
	request: APIRequestContext,
	path: string,
): Promise<void> {
	const read = await request.get(`/v1/files/${path}`, { headers: AUTH });
	const etag = read.headers().etag;
	if (!read.ok() || !etag) return;
	await request.delete(`/v1/files/${path}`, {
		headers: { ...AUTH, "if-match": etag },
	});
}

async function remoteContext(
	browser: Browser,
	testInfo: TestInfo,
): Promise<BrowserContext> {
	const context = await browser.newContext(testInfo.project.use);
	await context.addInitScript((token) => {
		window.TOLARIA_REMOTE_URL = window.location.origin;
		window.TOLARIA_REMOTE_TOKEN = token;
	}, COLLAB_TOKEN);
	return context;
}

/** The note's title shows; another's caret on it adds its name label to the heading's text. */
async function expectNoteShown(page: Page, title: string): Promise<void> {
	await expect(page.locator(".bn-editor h1").first()).toContainText(title, {
		timeout: JOIN_MS,
	});
}

/** Opens a note by its deep link (TOL-175): the list holds every other project's notes too. */
async function openNote(
	page: Page,
	{ path, title }: SeededNote,
): Promise<void> {
	await page.goto(`/?note=${encodeURIComponent(path)}`, { waitUntil: "load" });
	await expectNoteShown(page, title);
}

function avatars(page: Page) {
	return page.getByTestId("note-presence-avatar");
}

function remoteCursors(page: Page) {
	return page.locator('.bn-editor [data-testid="collab-cursor"]');
}

async function placeCaret(page: Page): Promise<void> {
	await page
		.locator(".bn-editor .bn-inline-content", { hasText: LINE })
		.click();
}

/** The name the other window shows for this one. */
async function nameSeenBy(page: Page): Promise<string> {
	await expect(avatars(page)).toHaveCount(1, { timeout: JOIN_MS });
	return (await avatars(page).getAttribute("aria-label")) ?? "";
}

async function shot(page: Page, testInfo: TestInfo, name: string) {
	await testInfo.attach(name, {
		body: await page.screenshot(),
		contentType: "image/png",
	});
}

test("two windows on a note see each other, and a window that leaves is gone within 5 s", async ({
	browser,
	request,
}, testInfo) => {
	const stamp = `${testInfo.project.name}-${Date.now()}`;
	const folder = `presence-${stamp}`;
	const shared: SeededNote = {
		path: `${folder}/shared.md`,
		title: `Shared ${stamp}`,
	};
	const elsewhere: SeededNote = {
		path: `${folder}/elsewhere.md`,
		title: `Elsewhere ${stamp}`,
	};
	await createNote(
		request,
		shared.path,
		`# ${shared.title}\n\n${LINE}\n\nSee [[${folder}/elsewhere]].\n`,
	);
	await createNote(request, elsewhere.path, `# ${elsewhere.title}\n\nBody.\n`);
	const hostContext = await remoteContext(browser, testInfo);
	const guestContext = await remoteContext(browser, testInfo);

	try {
		const host = await hostContext.newPage();
		const guest = await guestContext.newPage();
		await openNote(host, shared);
		await openNote(guest, shared);

		// Each sees the other's avatar, named after its browser and device.
		const guestName = await nameSeenBy(host);
		const hostName = await nameSeenBy(guest);
		expect(guestName).not.toBe("");
		expect(hostName).not.toBe("");

		// The others are listed by name on a tap, as a phone has no hover.
		await host.getByTestId("note-presence").click();
		await expect(host.getByTestId("note-presence-list")).toContainText(
			guestName,
		);
		await shot(host, testInfo, "presence-list");
		await host.keyboard.press("Escape");

		// A caret placed by one shows in the other with its name.
		await placeCaret(guest);
		await expect(remoteCursors(host)).toHaveCount(1, { timeout: JOIN_MS });
		await expect(remoteCursors(host)).toContainText(guestName);
		await placeCaret(host);
		await expect(remoteCursors(guest)).toContainText(hostName, {
			timeout: JOIN_MS,
		});
		await shot(host, testInfo, "presence-cursor");
		// The label stays phone-sized, so it never runs across the line it sits above.
		const label = await remoteCursors(host)
			.locator(".bn-collaboration-cursor__label")
			.boundingBox();
		expect(label?.width ?? 0).toBeLessThanOrEqual(170);

		// Switching note: the guest follows a link to another note.
		await guest
			.locator(`.bn-editor .wikilink[data-target="${folder}/elsewhere"]`)
			.focus();
		await guest.keyboard.press("Enter");
		await expectNoteShown(guest, elsewhere.title);
		await expect(avatars(host)).toHaveCount(0, { timeout: LEAVE_MS });
		await expect(remoteCursors(host)).toHaveCount(0);

		// Going offline.
		await openNote(guest, shared);
		await expect(avatars(host)).toHaveCount(1, { timeout: JOIN_MS });
		await guestContext.setOffline(true);
		await expect(avatars(host)).toHaveCount(0, { timeout: LEAVE_MS });

		// Back online, the guest is there again; then it closes its tab.
		await guestContext.setOffline(false);
		await expect(avatars(host)).toHaveCount(1, { timeout: JOIN_MS });
		await guest.close();
		await expect(avatars(host)).toHaveCount(0, { timeout: LEAVE_MS });
	} finally {
		await hostContext.close();
		await guestContext.close();
		await deleteNote(request, shared.path);
		await deleteNote(request, elsewhere.path);
	}
});

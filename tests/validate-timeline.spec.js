// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:9802';

// Expected decade data
const DECADES = [
  { key: '1950s', theme: 'The Road to Riverside', count: 7 },
  { key: '1960s', theme: 'Becoming a Historian', count: 6 },
  { key: '1970s', theme: 'Lurching into K-12 Education', count: 12 },
  { key: '1980s', theme: 'The All-Purpose Multiculturalist', count: 12 },
  { key: '1990s', theme: "Everybody's Adjunct", count: 12 },
  { key: '2000s', theme: 'Curtain Going Up', count: 12 },
  { key: '2010s', theme: 'Winding Down', count: 12 },
  { key: '2020s', theme: 'Zombie Time', count: 12 },
];

// Blacklisted terms (fabricated/removed items)
const BLACKLIST = [
  'Diversity Graduation Requirement',
  'Discovery Channel',
  '48 states',
  'Creating America',
  'Cruise Ship Scholar',
  'Knowledge Construction and Popular Culture',
  'Major Studio Consulting',
  'Intercultural Humor',
  'Civic Engagement as Multicultural',
];

// ===== Test Group 1: Timeline Structure =====

test.describe('Timeline Structure', () => {
  test('displays exactly 8 decade markers', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    const markers = page.locator('.decade-marker');
    await expect(markers).toHaveCount(8);
  });

  test('decade markers are in chronological order', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker-text', { timeout: 10000 });
    const labels = await page.locator('.decade-marker-text').allTextContents();
    const expected = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    expect(labels).toEqual(expected);
  });
});

// ===== Test Group 2: Decade Modals =====

test.describe('Decade Modals', () => {
  for (const decade of DECADES) {
    test(`${decade.key} modal shows ${decade.count} entries with theme "${decade.theme}"`, async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.decade-marker', { timeout: 10000 });

      // Click the decade marker
      await page.locator(`.decade-marker[data-decade="${decade.key}"]`).click();
      await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

      // Check theme
      const themeText = await page.locator('.decade-theme-label').textContent();
      expect(themeText).toContain(decade.theme);

      // Check entry count
      const entries = page.locator('.work-card-compact');
      await expect(entries).toHaveCount(decade.count);

      // Close modal
      await page.locator('#modal-decade .modal-close').click();
    });
  }
});

// ===== Test Group 3: Negative Tests (No Fabricated Data) =====

test.describe('No Fabricated Data', () => {
  for (const term of BLACKLIST) {
    test(`no entry mentions "${term}"`, async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.decade-marker', { timeout: 10000 });

      // Open each decade and check
      for (const decade of DECADES) {
        await page.locator(`.decade-marker[data-decade="${decade.key}"]`).click();
        await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

        const content = await page.locator('.decade-modal-layout').textContent();
        expect(content).not.toContain(term);

        await page.locator('#modal-decade .modal-close').click();
        await page.waitForTimeout(300);
      }
    });
  }

  test("Scouts' Honor shows 2025, not 2022", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    await page.locator('.decade-marker[data-decade="2020s"]').click();
    await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

    const scoutsCard = page.locator('.work-card-compact', { hasText: "Scouts' Honor" });
    const yearBadge = scoutsCard.locator('.work-year-badge');
    await expect(yearBadge).toHaveText('2025');
  });

  test('Panunzio Award shows 2021, not 2020', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    await page.locator('.decade-marker[data-decade="2020s"]').click();
    await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

    const card = page.locator('.work-card-compact', { hasText: 'Panunzio' });
    const yearBadge = card.locator('.work-year-badge');
    await expect(yearBadge).toHaveText('2021');
  });

  test("PBS 'Why in the World?' shows 1982, not 1995", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    await page.locator('.decade-marker[data-decade="1980s"]').click();
    await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

    const card = page.locator('.work-card-compact', { hasText: 'Why in the World' });
    const yearBadge = card.locator('.work-year-badge');
    await expect(yearBadge).toHaveText('1982');
  });

  test('Houghton Mifflin shows 2005, not 1986', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    await page.locator('.decade-marker[data-decade="2000s"]').click();
    await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

    const card = page.locator('.work-card-compact', { hasText: 'Houghton Mifflin' });
    const yearBadge = card.locator('.work-year-badge');
    await expect(yearBadge).toHaveText('2005');
  });
});

// ===== Test Group 4: UI Quality =====

test.describe('UI Quality', () => {
  test('no "undefined" or "null" text visible on page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('null');
  });

  test('modal opens and closes cleanly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });

    // Open decade modal
    await page.locator('.decade-marker[data-decade="1970s"]').click();
    await expect(page.locator('#modal-decade')).toHaveClass(/active/);

    // Close with X button
    await page.locator('#modal-decade .modal-close').click();
    await expect(page.locator('#modal-decade')).not.toHaveClass(/active/);
  });

  test('no empty description fields visible in decade modals', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });

    for (const decade of DECADES) {
      await page.locator(`.decade-marker[data-decade="${decade.key}"]`).click();
      await page.waitForSelector('.decade-modal-layout', { timeout: 5000 });

      const descriptions = await page.locator('.work-card-description').allTextContents();
      for (const desc of descriptions) {
        expect(desc.trim().length).toBeGreaterThan(0);
      }

      await page.locator('#modal-decade .modal-close').click();
      await page.waitForTimeout(300);
    }
  });

  test('responsive layout works at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('responsive layout works at 1024px width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('no placeholder text on page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.decade-marker', { timeout: 10000 });
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('TODO');
    expect(body).not.toContain('PLACEHOLDER');
    expect(body).not.toContain('TBD');
  });
});

// ===== Test Group 5: About Modal =====

test.describe('About Modal', () => {
  test('about modal displays correct biography info', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#btn-about', { timeout: 10000 });
    await page.locator('#btn-about').click();
    await page.waitForSelector('#bio-content', { timeout: 5000 });

    const bioText = await page.locator('#bio-content').textContent();
    expect(bioText).toContain('Carlos E. Cortés');
    expect(bioText).toContain('multicultural education');
    expect(bioText).not.toContain('Philadelphia');
  });
});

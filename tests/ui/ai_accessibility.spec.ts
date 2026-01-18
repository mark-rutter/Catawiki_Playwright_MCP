import { test, expect } from '../baseTest';
import AxeBuilder from '@axe-core/playwright';
import { HomePage } from '../../src/pages/HomePage';
import { SearchResultsPage } from '../../src/pages/SearchResultsPage';
import { LotPage } from '../../src/pages/LotPage';

/**
 * Accessibility (A11y) Tests for Catawiki
 * 
 * These tests use axe-core to validate WCAG compliance and accessibility standards
 * across key user journeys and page types. They report issues for improvement
 * rather than failing tests for existing accessibility gaps.
 */

test.describe('Accessibility (A11y) Tests', () => {
  
  const reportViolations = (violations: any[], testName: string) => {
    if (violations.length > 0) {
      console.log(`\n🚨 ${testName} - Found ${violations.length} accessibility violations:`);
      violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        violation.nodes.slice(0, 3).forEach((node: any, nodeIndex: number) => {
          console.log(`   • Element ${nodeIndex + 1}: ${node.html.substring(0, 100)}...`);
        });
      });
    } else {
      console.log(`✅ ${testName} - No accessibility violations found`);
    }
    return violations.length;
  };

  test('Homepage Accessibility Analysis', async ({ consentedPage: page }) => {
    test.setTimeout(45000);
    
    await test.step('🏠 Analyze Homepage Accessibility', async () => {
      // Run accessibility scan on homepage
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .exclude('.cookie-bar') // Exclude cookie bar which might be temporary
        .analyze();
      
      const violationCount = reportViolations(accessibilityScanResults.violations, 'Homepage');
      
      // Report to test results but don't fail
      test.info().attach('Homepage Accessibility Report', {
        body: JSON.stringify({
          violations: violationCount,
          passes: accessibilityScanResults.passes.length,
          details: accessibilityScanResults.violations
        }, null, 2),
        contentType: 'application/json'
      });
      
      console.log(`📊 Homepage Summary: ${violationCount} violations, ${accessibilityScanResults.passes.length} rules passed`);
      
      // Soft assertion - warn but don't fail
      expect.soft(violationCount, 'Homepage should have minimal accessibility violations').toBeLessThan(20);
    });

    await test.step('🎯 Check Key Homepage Elements', async () => {
      // Test specific critical elements
      const searchBox = page.getByRole('combobox', { name: /search/i });
      const searchButton = page.getByRole('button', { name: /search/i });
      
      // Verify search elements are accessible
      await expect(searchBox).toBeVisible();
      await expect(searchButton).toBeVisible();
      
      // Check for proper labels and ARIA attributes
      const searchBoxAccessibleName = await searchBox.getAttribute('aria-label') || await searchBox.getAttribute('placeholder');
      expect.soft(searchBoxAccessibleName, 'Search box should have accessible name').toBeTruthy();
      console.log(`✅ Search accessibility - Label: ${searchBoxAccessibleName}`);
    });
  });

  test('Search Results Page Accessibility Analysis', async ({ consentedPage: page }) => {
    test.setTimeout(60000);
    
    const homePage = new HomePage(page);
    const searchPage = new SearchResultsPage(page);
    
    await test.step('🔍 Navigate to Search Results', async () => {
      await homePage.search('train');
      await page.waitForLoadState('domcontentloaded');
      
      const isOpen = await searchPage.isOpen();
      expect(isOpen).toBe(true);
      console.log('✅ Search results page loaded');
    });

    await test.step('📋 Analyze Search Results Accessibility', async () => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.cookie-bar')
        .analyze();
      
      const violationCount = reportViolations(accessibilityScanResults.violations, 'Search Results');
      
      // Attach detailed report
      test.info().attach('Search Results Accessibility Report', {
        body: JSON.stringify({
          violations: violationCount,
          passes: accessibilityScanResults.passes.length,
          criticalIssues: accessibilityScanResults.violations.filter(v => v.impact === 'critical'),
          details: accessibilityScanResults.violations
        }, null, 2),
        contentType: 'application/json'
      });
      
      console.log(`📊 Search Results Summary: ${violationCount} violations, ${accessibilityScanResults.passes.length} rules passed`);
      expect.soft(violationCount, 'Search results should have reasonable accessibility').toBeLessThan(25);
    });
  });

  test('Keyboard Navigation Assessment', async ({ consentedPage: page }) => {
    test.setTimeout(45000);
    
    await test.step('⌨️ Test Keyboard Navigation', async () => {
      // Test Tab navigation
      const searchBox = page.getByRole('combobox', { name: /search/i });
      await searchBox.focus();
      
      // Verify focus is visible
      const isFocused = await searchBox.evaluate(el => document.activeElement === el);
      expect(isFocused).toBe(true);
      
      // Test keyboard interaction
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      const nextFocusedElement = page.locator(':focus');
      const isVisible = await nextFocusedElement.isVisible();
      expect.soft(isVisible, 'Next focused element should be visible').toBe(true);
      
      console.log('✅ Basic keyboard navigation working');
    });

    await test.step('🔍 Test Search Keyboard Functionality', async () => {
      const searchBox = page.getByRole('combobox', { name: /search/i });
      
      // Test search via Enter key
      await searchBox.focus();
      await searchBox.fill('vintage');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');
      
      // Check if navigation occurred (lenient check)
      const currentUrl = page.url();
      const didNavigate = !currentUrl.endsWith('/en') && !currentUrl.endsWith('/en/');
      expect.soft(didNavigate, 'Search should trigger navigation').toBe(true);
      
      if (didNavigate) {
        console.log('✅ Keyboard search working');
      } else {
        console.log('⚠️ Keyboard search may need attention');
      }
    });
  });

  test('Color Contrast Analysis', async ({ consentedPage: page }) => {
    test.setTimeout(45000);
    
    await test.step('🎨 Analyze Color Contrast', async () => {
      // Run specific color contrast check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.length;
      console.log(`🎨 Color Contrast Analysis: ${contrastViolations} violations found`);
      
      if (contrastViolations > 0) {
        console.log('\n📋 Color Contrast Issues:');
        accessibilityScanResults.violations.forEach((violation, index) => {
          violation.nodes.slice(0, 2).forEach((node: any, nodeIndex: number) => {
            const contrastData = node.any[0]?.data;
            if (contrastData) {
              console.log(`${index + 1}.${nodeIndex + 1} Contrast: ${contrastData.contrastRatio} (needs ${contrastData.expectedContrastRatio})`);
              console.log(`     Colors: ${contrastData.fgColor} on ${contrastData.bgColor}`);
            }
          });
        });
      }
      
      test.info().attach('Color Contrast Report', {
        body: JSON.stringify(accessibilityScanResults.violations, null, 2),
        contentType: 'application/json'
      });
      
      // Soft assertion for improvement tracking
      expect.soft(contrastViolations, 'Color contrast violations should be minimized').toBeLessThan(15);
    });
  });

  test('Form and Input Accessibility Assessment', async ({ consentedPage: page }) => {
    test.setTimeout(45000);
    
    await test.step('📝 Analyze Form Accessibility', async () => {
      // Check search form elements
      const searchBox = page.getByRole('combobox', { name: /search/i });
      const searchButton = page.getByRole('button', { name: /search/i });
      
      // Test form labels and associations
      const searchBoxId = await searchBox.getAttribute('id');
      const searchBoxAriaLabel = await searchBox.getAttribute('aria-label');
      const searchBoxPlaceholder = await searchBox.getAttribute('placeholder');
      
      const hasLabel = !!(searchBoxId || searchBoxAriaLabel || searchBoxPlaceholder);
      expect.soft(hasLabel, 'Search box should have some form of accessible labeling').toBe(true);
      
      console.log(`📝 Form Analysis:`);
      console.log(`   ID: ${searchBoxId || 'none'}`);
      console.log(`   ARIA Label: ${searchBoxAriaLabel || 'none'}`);
      console.log(`   Placeholder: ${searchBoxPlaceholder || 'none'}`);
      console.log(`   Has accessible label: ${hasLabel ? '✅' : '❌'}`);
      
      // Test basic form interaction
      try {
        await searchBox.focus();
        await searchBox.fill('test-form');
        console.log('✅ Form input working');
      } catch (error) {
        console.log('⚠️ Form interaction may need attention');
      }
    });
  });

  test('Screen Reader Compatibility Check', async ({ consentedPage: page }) => {
    test.setTimeout(45000);
    
    await test.step('🔊 Check Screen Reader Features', async () => {
      // Check for proper ARIA landmarks
      const main = page.locator('[role="main"], main');
      const navigation = page.locator('[role="navigation"], nav');
      const banner = page.locator('[role="banner"], header');
      
      const mainCount = await main.count();
      const navCount = await navigation.count();
      const bannerCount = await banner.count();
      
      console.log(`🔊 Screen Reader Analysis:`);
      console.log(`   Main landmarks: ${mainCount}`);
      console.log(`   Navigation landmarks: ${navCount}`);
      console.log(`   Banner landmarks: ${bannerCount}`);
      
      // Check for skip links
      const skipLinks = page.locator('a[href="#main"], a[href="#content"], a[href*="skip"]');
      const skipLinkCount = await skipLinks.count();
      console.log(`   Skip links: ${skipLinkCount}`);
      
      // Check page title
      const pageTitle = await page.title();
      console.log(`   Page title: "${pageTitle}"`);
      
      expect.soft(pageTitle.length, 'Page should have a descriptive title').toBeGreaterThan(0);
      expect.soft(mainCount, 'Page should have identifiable main content').toBeGreaterThan(0);
      
      console.log(mainCount > 0 ? '✅ Main content identifiable' : '⚠️ Main content may need better identification');
    });
  });

  test('Overall Accessibility Summary', async ({ consentedPage: page }) => {
    test.setTimeout(60000);
    
    await test.step('📊 Generate Comprehensive Accessibility Report', async () => {
      // Run comprehensive scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .exclude('.cookie-bar')
        .analyze();
      
      const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
      const seriousViolations = accessibilityScanResults.violations.filter(v => v.impact === 'serious');
      const moderateViolations = accessibilityScanResults.violations.filter(v => v.impact === 'moderate');
      const minorViolations = accessibilityScanResults.violations.filter(v => v.impact === 'minor');
      
      const summary = {
        total_violations: accessibilityScanResults.violations.length,
        total_passes: accessibilityScanResults.passes.length,
        breakdown: {
          critical: criticalViolations.length,
          serious: seriousViolations.length,
          moderate: moderateViolations.length,
          minor: minorViolations.length
        },
        top_issues: accessibilityScanResults.violations.slice(0, 5).map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          affected_elements: v.nodes.length
        }))
      };
      
      console.log(`\n📊 ACCESSIBILITY SUMMARY FOR CATAWIKI:`);
      console.log(`═══════════════════════════════════════════════════════`);
      console.log(`Total Violations: ${summary.total_violations}`);
      console.log(`Total Passes: ${summary.total_passes}`);
      console.log(`\nBreakdown by Severity:`);
      console.log(`  🔴 Critical: ${summary.breakdown.critical}`);
      console.log(`  🟠 Serious: ${summary.breakdown.serious}`);
      console.log(`  🟡 Moderate: ${summary.breakdown.moderate}`);
      console.log(`  🔵 Minor: ${summary.breakdown.minor}`);
      console.log(`═══════════════════════════════════════════════════════\n`);
      
      test.info().attach('Complete Accessibility Summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json'
      });
      
      // Success criteria - lenient but tracks progress
      expect.soft(criticalViolations.length, 'Critical accessibility violations should be minimal').toBeLessThan(5);
      expect.soft(summary.total_passes, 'Should pass many accessibility checks').toBeGreaterThan(50);
    });
  });
});
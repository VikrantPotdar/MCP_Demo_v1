import { test } from '@playwright/test';
import * as XLSX from 'xlsx';
import { LoginPage } from '../pages/LoginPage';

type LoginData = {
  Username: string;
  Password: string;
  Expected: 'Dashboard' | 'Invalid credentials';
};

const normalizeExpected = (value: string): LoginData['Expected'] => {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes('dashboard')) {
    return 'Dashboard';
  }

  if (normalized.includes('invalid')) {
    return 'Invalid credentials';
  }

  throw new Error(`Unsupported Expected value: ${value}`);
};

const workbook = XLSX.readFile('test_data/loginData.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const loginData = XLSX.utils
  .sheet_to_json<Record<string, string>>(worksheet, { defval: '' })
  .map((row): LoginData => ({
    Username: row.Username.trim(),
    Password: row.Password.trim(),
    Expected: normalizeExpected(row.Expected),
  }));

if (loginData.length === 0) {
  throw new Error('No login data was found in test_data/loginData.xlsx');
}

test.describe('OrangeHRM data-driven login validation', () => {
  for (const data of loginData) {
    test(`${data.Username} expects ${data.Expected}`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      try {
        await loginPage.goto();
        await loginPage.login(data.Username, data.Password);

        if (data.Expected === 'Dashboard') {
          await loginPage.expectDashboard();
        } else if (data.Expected === 'Invalid credentials') {
          await loginPage.expectInvalidCredentials();
        } else {
          throw new Error(`Unsupported Expected value: ${data.Expected}`);
        }

        console.log(`PASS | Username: ${data.Username} | Expected: ${data.Expected}`);
      } catch (error) {
        console.log(`FAIL | Username: ${data.Username} | Expected: ${data.Expected}`);
        throw error;
      }
    });
  }
});
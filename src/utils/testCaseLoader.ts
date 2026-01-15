import fs from 'fs';

export interface TestCase {
  description: string;
  keyword: string;
  expectedResults: boolean;
}

export function loadTestCases(path: string): TestCase[] {
  const raw = fs.readFileSync(path, 'utf-8');
  return JSON.parse(raw).cases;
}
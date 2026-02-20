#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const COMMIT_LIMIT = 12;
const OUTPUT_PATH = path.join(process.cwd(), 'src/content/blog/auto-release-notes.md');

const runGit = (command) => {
  try {
    return execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
};

const toGithubRepoUrl = (remoteUrl) => {
  if (!remoteUrl) return '';

  if (remoteUrl.startsWith('git@github.com:')) {
    const repo = remoteUrl.replace('git@github.com:', '').replace(/\.git$/, '');
    return `https://github.com/${repo}`;
  }

  if (remoteUrl.startsWith('https://github.com/')) {
    return remoteUrl.replace(/\.git$/, '');
  }

  return '';
};

const extractPrNumber = (subject) => {
  const matchers = [/\(#(\d+)\)/, /pull request #(\d+)/i, /#(\d+)/];
  for (const matcher of matchers) {
    const matched = subject.match(matcher);
    if (matched?.[1]) {
      return matched[1];
    }
  }
  return null;
};

const toIsoDateOnly = (isoDate) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
};

const toDisplayDate = (isoDate) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'unknown date';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const logOutput = runGit(
  `git log -n ${COMMIT_LIMIT} --pretty=format:%H%x09%h%x09%cI%x09%s`,
);
const remoteUrl = runGit('git config --get remote.origin.url');
const githubRepoUrl = toGithubRepoUrl(remoteUrl);

const entries = logOutput
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [hash, shortHash, committedAt, ...subjectParts] = line.split('\t');
    const subject = subjectParts.join('\t').replace(/\s+/g, ' ').trim();
    const prNumber = extractPrNumber(subject);

    return {
      hash,
      shortHash,
      committedAt,
      subject,
      prNumber,
    };
  })
  .filter((entry) => entry.hash && entry.shortHash && entry.committedAt && entry.subject);

const today = new Date().toISOString().slice(0, 10);
const postDate = entries[0] ? toIsoDateOnly(entries[0].committedAt) : today;

const summary =
  entries.length > 0
    ? `Auto-generated from the latest ${entries.length} commits and PR references.`
    : 'Auto-generated release note placeholder. No git commit metadata was found.';

const lines = entries.length
  ? entries.map((entry) => {
      const commitRef = githubRepoUrl
        ? `[\`${entry.shortHash}\`](${githubRepoUrl}/commit/${entry.hash})`
        : `\`${entry.shortHash}\``;

      const prRef =
        entry.prNumber && githubRepoUrl
          ? ` · PR [#${entry.prNumber}](${githubRepoUrl}/pull/${entry.prNumber})`
          : entry.prNumber
            ? ` · PR #${entry.prNumber}`
            : '';

      return `- ${toDisplayDate(entry.committedAt)} — ${commitRef}: ${entry.subject}${prRef}`;
    })
  : ['- No commit history available in this environment.'];

const markdown = `---
id: auto-release-notes
title: Mini Release Notes (Auto)
date: ${postDate}
category: release
summary: ${summary}
---
Generated automatically from git history.

${lines.join('\n')}
`;

mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, markdown, 'utf8');

console.log(`[release-notes] wrote ${OUTPUT_PATH} (${entries.length} entries)`);

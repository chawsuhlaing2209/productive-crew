#!/usr/bin/env node
// project.js — where the design system lives.
//
// The crew ships as a plugin, so the scripts sit in ${CLAUDE_PLUGIN_ROOT} while the design
// system they read sits in the user's repo. Every path a script touches goes through here.

import { join } from 'node:path';

export const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function projectPath(...parts) {
  return join(PROJECT_ROOT, ...parts);
}

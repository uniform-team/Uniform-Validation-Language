#!/usr/local/bin/node

const denodeify = require("denodeify");
const fs = require("fs");

// Promisify dependencies
const rename = denodeify(fs.rename);
const symlink = denodeify(fs.symlink);

const ERROR_CODES = Object.freeze({
    FILE_NOT_FOUND: "ENOENT"
});
const POST_MERGE = "post-merge";
const POST_MERGE_BKUP = POST_MERGE + ".bkup";
const HOOKS_DIR = "scripts/hooks";
const GIT_HOOKS_DIR = ".git/hooks";

// Move into destination directory to create symlink here
process.chdir(GIT_HOOKS_DIR);

// Remove any existing post-merge hook and back it up
rename(POST_MERGE, POST_MERGE_BKUP).then(function () {
    console.log(`Backed up existing ${GIT_HOOKS_DIR}/${POST_MERGE} to ${GIT_HOOKS_DIR}/${POST_MERGE_BKUP}`);
}, function (err) {
    if (err.code === ERROR_CODES.FILE_NOT_FOUND) {
        return; // Ignore file not found errors, no post-merge to back up
    }
    
    throw err; // Rethrow error
}).then(function () {
    // Symlink back up to the root directory and then down to the post-merge script
    return symlink("../../" + HOOKS_DIR, POST_MERGE);
}).then(function () {
    // Log and exit successfully
    console.log(`Symlinked ${POST_MERGE} Git hook.`);
    process.exit(0 /* success */);
}, function (err) {
    // Log and exit with error
    console.error(`Failed to symlink ${POST_MERGE} Git hook.`, err);
    process.exit(1 /* error */);
});
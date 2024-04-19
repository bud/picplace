# Determining Access Levels

For certain resources in PicPlace, they have different requirements to viewing and editing.

## User

Everyone has `view` access.

Only owners or admins have `edit` access.

## Quiz

If a quiz is not public, then people who are not owners, in the whitelist, or an admin have `none` access.

If a quiz is not public, then people who are owners, in the whitelist, or an admin have `view` access.

If the quiz is public, everyone has `view` access.

Only owners or admins have `edit` access.

## Play

If a play is not public, then those who are not owners or admins have `none` access.

If a play is public, then everyone has `view` access.

Only owners and admins have `edit` access.

## Comment

Users with `none` access on the quiz have `none` access on the comment.

Users with `view` acccess on the quiz have `view` access on the comment.

Only the comment owner and admins have `edit` access on the comment.

## Report

Anyone not an admin has `none` access.

Admins have `edit` access.
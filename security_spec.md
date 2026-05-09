# Security Spec for Versusfy Community Forum

## 1. Data Invariants
- Posts must have a valid rating (1-5).
- Content cannot exceed 2000 characters to prevent resource exhaustion.
- Likes and Hearts can only be incremented, not arbitrarily set.
- `createdAt` must be `request.time`.
- If `isAnonymous` is false, `firstName` and `lastName` must be provided and be valid strings.

## 2. The Dirty Dozen Payloads (Targeting forum_posts)

1. **The ID Poisoning**: `create` with a 2MB string as document ID.
2. **The Shadow Field**: `create` with `{ "ghost": "payload", "content": "valid" }`.
3. **The Rating Overflow**: `create` with `rating: 99`.
4. **The Identity Spoof**: `update` to change `isAnonymous` from `false` to `true` on someone else's post.
5. **The Like Bomb**: `update` to set `likes: 1000000` in one request.
6. **The Negative Spark**: `update` to set `hearts: -1`.
7. **The Time Warp**: `create` with `createdAt` set to a date in 1999.
8. **The PII Leak**: `list` query that attempts to scrape all non-anonymous names (Rules must enforce list boundaries).
9. **The Gigantism**: `create` with `content` containing 5MB of text.
10. **The Orphan Write**: `create` with a fake `heroTicketId` that doesn't exist (if checked).
11. **The Field Hijack**: `update` to change the `content` of an existing post.
12. **The Delete Rampage**: `delete` on a post by a random guest.

## 3. Test Strategy
- Every write MUST pass `isValidForumPost()`.
- Updates are restricted to engagement counters (likes/hearts) only for non-owners.
- Deletion is restricted (e.g., only by moderator or creator - though creator identification is hard without auth).

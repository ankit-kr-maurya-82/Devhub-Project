/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Administration]
 *     summary: Read platform counts, recent registrations, and moderation activity
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Database-backed account, Q&A, blog, coding, submission, and report counts; safe recent user fields; and audit activity }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Administrator access required }
 * /api/v1/admin/users:
 *   get:
 *     tags: [Administration]
 *     summary: Search and paginate users without secret fields
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *       - { in: query, name: search, schema: { type: string, maxLength: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, suspended] } }
 *     responses:
 *       '200': { description: Sanitized user page }
 *       '403': { description: Administrator access required }
 * /api/v1/admin/users/{userId}/status:
 *   patch:
 *     tags: [Administration]
 *     summary: Suspend or reactivate an account (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/ObjectId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [isActive], additionalProperties: false, properties: { isActive: { type: boolean } } }
 *     responses:
 *       '200': { description: Account status changed and action audited }
 *       '400': { description: Invalid request or self status change }
 *       '403': { description: Administrator access required }
 *       '409': { description: Concurrent update or administrator suspension is restricted }
 *       '503': { description: The account update is pending audit reconciliation }
 * /api/v1/reports:
 *   post:
 *     tags: [Moderation]
 *     summary: Submit a report for supported content or an account
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [targetType, targetId, reason], additionalProperties: false, properties: { targetType: { type: string, enum: [blog, question, answer, comment, user] }, targetId: { type: string }, reason: { type: string, maxLength: 100 }, details: { type: string, maxLength: 2000 } } }
 *     responses:
 *       '201': { description: Report queued for admin review }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/admin/reports:
 *   get:
 *     tags: [Moderation]
 *     summary: Paginate reports (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *       - { in: query, name: status, schema: { type: string, enum: [open, reviewing, processing, resolved, dismissed] } }
 *       - { in: query, name: targetType, schema: { type: string, enum: [blog, question, answer, comment, user] } }
 *     responses:
 *       '200': { description: Reports with sanitized target previews and pending action recovery details }
 *       '403': { description: Administrator access required }
 * /api/v1/admin/reports/{reportId}:
 *   patch:
 *     tags: [Moderation]
 *     summary: Review, dismiss, hide, restore, suspend, or reactivate a reported target
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reportId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [action], additionalProperties: false, properties: { action: { type: string, enum: [review, dismiss, hide, restore, suspend, reactivate] }, note: { type: string, maxLength: 1000 } } }
 *     responses:
 *       '200': { description: Report and audit trail updated }
 *       '403': { description: Administrator access required }
 *       '409': { description: Report closed, concurrent moderation, or administrator suspension restricted }
 *       '503': { description: Operation remains pending; retry the identical action to reconcile it }
 *
 * /api/v1/coding/problems/manage:
 *   get:
 *     tags: [Coding]
 *     summary: List all problems including drafts (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *     responses:
 *       '200': { description: Admin problem page }
 *       '403': { description: Administrator access required }
 * /api/v1/coding/problems/manage/{slug}:
 *   get:
 *     tags: [Coding]
 *     summary: Get a draft or published problem for editing (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Problem details }
 *       '403': { description: Administrator access required }
 *       '404': { description: Problem not found }
 * /api/v1/coding/problems:
 *   get:
 *     tags: [Coding]
 *     summary: List published problems with pagination and filters
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *       - { in: query, name: difficulty, schema: { type: string, enum: [easy, medium, hard] } }
 *       - { in: query, name: topic, schema: { type: string, maxLength: 40 } }
 *     responses:
 *       '200': { description: Published problem page }
 *   post:
 *     tags: [Coding]
 *     summary: Create a problem and its sample cases (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '201': { description: Problem created }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Administrator access required }
 * /api/v1/coding/problems/{slug}:
 *   get:
 *     tags: [Coding]
 *     summary: Get a published problem and sample cases
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Published problem }
 *       '404': { description: Problem not found }
 *   patch:
 *     tags: [Coding]
 *     summary: Update problem and sample cases (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Problem updated }
 *       '403': { description: Administrator access required }
 *   delete:
 *     tags: [Coding]
 *     summary: Delete a problem (administrator only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Problem deleted }
 *       '403': { description: Administrator access required }
 * /api/v1/coding/problems/{slug}/submissions:
 *   post:
 *     tags: [Coding]
 *     summary: Store an authenticated code submission
 *     description: Source is not executed; verdict remains unavailable until a secure isolated judge is configured.
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '201': { description: Submission stored with unavailable verdict and executed false }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/submissions:
 *   get:
 *     tags: [Coding]
 *     summary: List the authenticated user's submissions
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: User-scoped submission history without source code }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: List published blogs with pagination, search, and tag filtering
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *       - { in: query, name: search, schema: { type: string, maxLength: 100 } }
 *       - { in: query, name: tag, schema: { type: string, maxLength: 30 } }
 *     responses:
 *       '200': { description: Published blog page and pagination metadata }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *   post:
 *     tags: [Blogs]
 *     summary: Create an authenticated user's blog
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [title, content], properties: { title: { type: string, minLength: 5, maxLength: 180 }, slug: { type: string, pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' }, content: { type: string, minLength: 20, maxLength: 40000 }, tags: { type: array, maxItems: 10, items: { type: string, maxLength: 30 } }, status: { type: string, enum: [draft, published] } } }
 *     responses:
 *       '201': { description: Blog created; author is taken from the authenticated account }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '409': { description: Slug already exists }
 * /api/v1/blogs/mine:
 *   get:
 *     tags: [Blogs]
 *     summary: List the authenticated user's blogs, including drafts
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50 } }
 *     responses:
 *       '200': { description: Owner's blog page }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/blogs/mine/{slug}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get one of the authenticated user's blogs, including drafts
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Owner's blog }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: Blog not found for this owner }
 * /api/v1/blogs/{slug}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get a published blog by slug
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Published blog }
 *       '404': { description: Published blog not found }
 *   patch:
 *     tags: [Blogs]
 *     summary: Update an owned blog
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { title: { type: string, minLength: 5, maxLength: 180 }, slug: { type: string }, content: { type: string, minLength: 20, maxLength: 40000 }, tags: { type: array, maxItems: 10, items: { type: string, maxLength: 30 } }, status: { type: string, enum: [draft, published] } } }
 *     responses:
 *       '200': { description: Blog updated }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Blog belongs to another author }
 *       '409': { description: Slug already exists }
 *   delete:
 *     tags: [Blogs]
 *     summary: Delete an owned blog
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       '200': { description: Blog deleted }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Blog belongs to another author }
 *       '404': { description: Blog not found }
 *
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [username, email, password], properties: { name: { type: string, maxLength: 100 }, username: { type: string }, email: { type: string, format: email }, password: { type: string, format: password } } }
 *     responses:
 *       '201': { description: User registered; response contains message and user, and may include a development-only JWT token }
 *       '400': { description: Invalid or duplicate registration input }
 *       '429': { $ref: '#/components/responses/RateLimited' }
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [email, password], properties: { email: { type: string, format: email }, password: { type: string, format: password } } }
 *     responses:
 *       '200': { description: Login successful; sets the HttpOnly token cookie and returns message, optional development token, and user }
 *       '400': { description: Invalid credentials or input }
 *       '429': { $ref: '#/components/responses/RateLimited' }
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get the authenticated user's account profile
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Current user fields excluding password and secrets }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/auth/dashboard:
 *   get:
 *     tags: [Authentication]
 *     summary: Render the authenticated dashboard
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Pug dashboard page }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/auth/logout:
 *   get:
 *     tags: [Authentication]
 *     summary: Clear the authentication cookie
 *     responses:
 *       '200': { description: Logout confirmation }
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset instructions (also available at /forget-password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [email], properties: { email: { type: string, format: email } } }
 *     responses:
 *       '200': { description: Generic reset request response; development reset links are delivered only through the server's local development output }
 *       '400': { description: Invalid input }
 *       '429': { $ref: '#/components/responses/RateLimited' }
 * /api/v1/auth/forget-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Alias for requesting password reset instructions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [email], properties: { email: { type: string, format: email } } }
 *     responses:
 *       '200': { description: Generic reset request response; development reset links are delivered only through the server's local development output }
 *       '400': { description: Invalid input }
 *       '429': { $ref: '#/components/responses/RateLimited' }
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password using a reset token
 *     parameters:
 *       - { in: path, name: token, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [password, confirmPassword], properties: { password: { type: string, format: password }, confirmPassword: { type: string, format: password } } }
 *     responses:
 *       '200': { description: Password reset confirmation }
 *       '400': { description: Invalid or expired token or invalid input }
 *       '429': { $ref: '#/components/responses/RateLimited' }
 * /api/v1/user/profile/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get public profile fields
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/ObjectId' }
 *     responses:
 *       '200': { description: Profile data excluding private fields }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: User not found }
 * /api/v1/user/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { name: { type: string, maxLength: 100 }, username: { type: string, maxLength: 30 }, bio: { type: string, maxLength: 300 }, avatar: { type: string, maxLength: 2048 }, skills: { type: array, maxItems: 30, items: { type: string, maxLength: 40 } } } }
 *     responses:
 *       '200': { description: Updated profile data }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/users/me/presence:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's presence
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Presence information }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/users/{userId}/presence:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's presence
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/ObjectId' }
 *     responses:
 *       '200': { description: Presence information }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: User not found }
 * /api/v1/questions:
 *   get:
 *     tags: [Questions]
 *     summary: List questions
 *     responses:
 *       '200': { description: Question list }
 *   post:
 *     tags: [Questions]
 *     summary: Create a question for the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [title, description], properties: { title: { type: string, minLength: 10, maxLength: 200 }, description: { type: string, maxLength: 10000 }, tags: { type: array, maxItems: 10, items: { type: string, maxLength: 30 } } } }
 *     responses:
 *       '201': { description: Created question }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/questions/{questionId}:
 *   get:
 *     tags: [Questions]
 *     summary: Get a question
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     responses:
 *       '200': { description: Question data }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '404': { description: Question not found }
 *   patch:
 *     tags: [Questions]
 *     summary: Update a question owned by the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { title: { type: string }, description: { type: string }, tags: { type: array, items: { type: string } } } }
 *     responses:
 *       '200': { description: Updated question }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not the owner }
 *       '404': { description: Question not found }
 *   delete:
 *     tags: [Questions]
 *     summary: Delete a question owned by the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     responses:
 *       '200': { description: Deletion confirmation }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not the owner }
 *       '404': { description: Question not found }
 * /api/v1/questions/{questionId}/vote:
 *   post:
 *     tags: [Questions]
 *     summary: Vote on a question
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     responses:
 *       '200': { description: Vote result }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/questions/{questionId}/answers:
 *   get:
 *     tags: [Answers]
 *     summary: List answers for a question
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     responses:
 *       '200': { description: Answer list }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '404': { description: Question not found }
 *   post:
 *     tags: [Answers]
 *     summary: Create an answer
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string, maxLength: 10000 } } }
 *     responses:
 *       '201': { description: Created answer }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: Question not found }
 * /api/v1/questions/{questionId}/answers/{answerId}/accept:
 *   patch:
 *     tags: [Answers]
 *     summary: Accept an answer on a question owned by the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *       - { $ref: '#/components/parameters/AnswerId' }
 *     responses:
 *       '200': { description: Accepted answer }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not the question owner }
 *       '404': { description: Question or answer not found }
 * /api/v1/answers/{answerId}/vote:
 *   post:
 *     tags: [Answers]
 *     summary: Vote on an answer
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/AnswerId' }
 *     responses:
 *       '200': { description: Vote result }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/questions/{questionId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List question comments
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     responses:
 *       '200': { description: Comment list }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *   post:
 *     tags: [Comments]
 *     summary: Add a question comment
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/QuestionId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string } } }
 *     responses:
 *       '201': { description: Created comment }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/answers/{answerId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: List answer comments
 *     parameters:
 *       - { $ref: '#/components/parameters/AnswerId' }
 *     responses:
 *       '200': { description: Comment list }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *   post:
 *     tags: [Comments]
 *     summary: Add an answer comment
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/AnswerId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string } } }
 *     responses:
 *       '201': { description: Created comment }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/comments/{commentId}:
 *   patch:
 *     tags: [Comments]
 *     summary: Update a comment owned by the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { name: commentId, in: path, required: true, schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string } } }
 *     responses:
 *       '200': { description: Updated comment }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not the comment owner }
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment owned by the authenticated user
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { name: commentId, in: path, required: true, schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' } }
 *     responses:
 *       '200': { description: Deletion confirmation }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not the comment owner }
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List the authenticated user's notifications
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 50, default: 20 } }
 *       - { name: unread, in: query, schema: { type: boolean } }
 *     responses:
 *       '200': { description: Notifications owned by the authenticated user }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get the authenticated user's unread notification count
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Unread notification count }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications read
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     responses:
 *       '200': { description: Update result }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/notifications/{notificationId}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark one notification read
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { name: notificationId, in: path, required: true, schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' } }
 *     responses:
 *       '200': { description: Update result }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: Notification not found }
 * /api/v1/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete one notification
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { name: notificationId, in: path, required: true, schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' } }
 *     responses:
 *       '200': { description: Deletion result }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: Notification not found }
 * /api/v1/rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: List public rooms
 *     responses:
 *       '200': { description: Public rooms and pagination }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *   post:
 *     tags: [Rooms]
 *     summary: Create a room; creator is the owner and first member
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [name], properties: { name: { type: string, minLength: 3, maxLength: 100 }, description: { type: string, maxLength: 500 }, category: { type: string, enum: [programming, technology, general, career, college, gaming, other] }, isPublic: { type: boolean }, maxMembers: { type: integer, minimum: 1 } } }
 *     responses:
 *       '201': { description: Created room }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/rooms/{roomId}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get a room (private rooms require membership)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/RoomId' }
 *     responses:
 *       '200': { description: Room data }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not a private room member }
 *       '404': { description: Room not found }
 * /api/v1/rooms/{roomId}/join:
 *   post:
 *     tags: [Rooms]
 *     summary: Join a public room
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/RoomId' }
 *     responses:
 *       '200': { description: Joined room }
 *       '400': { description: Already member or room full }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Private room }
 *       '404': { description: Room not found }
 * /api/v1/rooms/{roomId}/leave:
 *   post:
 *     tags: [Rooms]
 *     summary: Leave a room
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/RoomId' }
 *     responses:
 *       '200': { description: Left room }
 *       '400': { description: Owner cannot leave or user is not a member }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { description: Room not found }
 * /api/v1/rooms/{roomId}/messages:
 *   get:
 *     tags: [Messages]
 *     summary: List messages in a room (members only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/RoomId' }
 *     responses:
 *       '200': { description: Paginated messages; soft-deleted message content is redacted }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not a room member }
 *   post:
 *     tags: [Messages]
 *     summary: Send a room message (members only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/RoomId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string, minLength: 1, maxLength: 2000 }, messageType: { type: string, enum: [text, image, file] }, replyTo: { type: string, pattern: '^[a-fA-F0-9]{24}$', nullable: true } } }
 *     responses:
 *       '201': { description: Created message }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not a room member }
 *       '404': { description: Room or reply target not found }
 * /api/v1/messages/{messageId}:
 *   patch:
 *     tags: [Messages]
 *     summary: Edit own message (room members only)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/MessageId' }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object, required: [content], properties: { content: { type: string, minLength: 1, maxLength: 2000 } } }
 *     responses:
 *       '200': { description: Updated message }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not permitted to edit }
 *       '404': { description: Message not found }
 *   delete:
 *     tags: [Messages]
 *     summary: Soft-delete own message (room owner may delete room messages)
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/MessageId' }
 *     responses:
 *       '200': { description: Deletion result }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not permitted to delete }
 *       '404': { description: Message or room not found }
 * /api/v1/messages/{messageId}/reaction:
 *   post:
 *     tags: [Messages]
 *     summary: Toggle a reaction on a room message
 *     security: [{ cookieAuth: [] }, { bearerAuth: [] }]
 *     parameters:
 *       - { $ref: '#/components/parameters/MessageId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [emoji], properties: { emoji: { type: string, minLength: 1, maxLength: 10 } } }
 *     responses:
 *       '200': { description: Reaction update }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { description: Not a room member }
 *       '404': { description: Message or room not found }
 *
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   parameters:
 *     ObjectId:
 *       name: userId
 *       in: path
 *       required: true
 *       schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' }
 *     QuestionId:
 *       name: questionId
 *       in: path
 *       required: true
 *       schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' }
 *     AnswerId:
 *       name: answerId
 *       in: path
 *       required: true
 *       schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' }
 *     RoomId:
 *       name: roomId
 *       in: path
 *       required: true
 *       schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' }
 *     MessageId:
 *       name: messageId
 *       in: path
 *       required: true
 *       schema: { type: string, pattern: '^[a-fA-F0-9]{24}$' }
 *   responses:
 *     BadRequest:
 *       description: Invalid request, payload, or ObjectId
 *     Unauthorized:
 *       description: Missing, invalid, expired, or inactive-user JWT
 *     RateLimited:
 *       description: Too many requests
 */
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "DevHub API",
      version: "1.0.0",
      description: "API documentation generated from the backend's current Express routes.",
    },
    servers: [{ url: "/", description: "Current server" }],
    tags: [
      { name: "Authentication" }, { name: "Users" }, { name: "Questions" },
      { name: "Answers" }, { name: "Comments" }, { name: "Notifications" },
      { name: "Rooms" }, { name: "Messages" }, { name: "Blogs" }, { name: "Coding" }, { name: "Administration" }, { name: "Moderation" },
    ],
  },
  apis: [fileURLToPath(new URL("./openapi.js", import.meta.url))],
};

const openapiSpecification = swaggerJSDoc(options);
export default openapiSpecification;

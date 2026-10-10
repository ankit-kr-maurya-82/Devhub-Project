/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [username, email, password], properties: { username: { type: string }, email: { type: string, format: email }, password: { type: string, format: password } } }
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
 *       '200': { description: Generic reset request response; development may include resetToken and resetUrl }
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
 *       '200': { description: Generic reset request response; development may include resetToken and resetUrl }
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
 *     responses:
 *       '200': { description: Notifications owned by the authenticated user }
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
      { name: "Rooms" }, { name: "Messages" },
    ],
  },
  apis: [fileURLToPath(new URL("./openapi.js", import.meta.url))],
};

const openapiSpecification = swaggerJSDoc(options);
export default openapiSpecification;

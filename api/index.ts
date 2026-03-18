/**
 * Vercel Serverless Function entry point.
 *
 * This file exports the Express `app` so Vercel can serve all `/api/*` routes
 * as a single serverless function. Vercel automatically wraps the default
 * export (an Express app) into a Node.js serverless handler.
 *
 * See: https://vercel.com/docs/functions/runtimes#using-express.js
 */
import { app } from '../server/src/app.js';

export default app;

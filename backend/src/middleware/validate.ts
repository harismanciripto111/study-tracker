import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Express middleware factory that validates request body, query, and params
 * against the provided Zod schema.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), authController.login);
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };
}

/**
 * Validates only req.body against the provided Zod schema.
 * Slightly more concise for routes that don't use query/params.
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };
}

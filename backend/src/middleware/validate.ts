import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

function formatZodErrors(err: ZodError) {
  return err.flatten().fieldErrors;
}

/**
 * Validate req.body against a Zod schema.
 * Returns 400 with field errors if validation fails.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formatZodErrors(result.error),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate req.query against a Zod schema.
 * Returns 400 with field errors if validation fails.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: formatZodErrors(result.error),
      });
      return;
    }
    // Assign parsed/coerced values back
    req.query = result.data as Record<string, string>;
    next();
  };
}

/**
 * Validate req.params against a Zod schema.
 * Returns 400 with field errors if validation fails.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Params validation error',
        errors: formatZodErrors(result.error),
      });
      return;
    }
    req.params = result.data as Record<string, string>;
    next();
  };
}

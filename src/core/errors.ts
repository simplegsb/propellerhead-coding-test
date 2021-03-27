export class NotFoundError extends Error
{
}

export class ValidationError extends Error
{
  constructor(public messages?: string[])
  {
    super();
  }
}

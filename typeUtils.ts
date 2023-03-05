function hasProperty<X extends unknown, Y extends PropertyKey>(
  obj: X | null | undefined,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop) ?? false;
}

export function isString(obj: unknown): obj is string {
  return typeof obj === "string";
}

export function isNumber(obj: unknown): obj is number {
  return typeof obj === "number";
}

export function isBoolean(obj: unknown): obj is boolean {
  return typeof obj === "boolean";
}

export function hasPropertyAsType<X extends unknown, Y extends PropertyKey, T>(
  obj: X | null | undefined,
  prop: Y,
  check: { (arg: unknown): arg is T }
): obj is X & Record<Y, T> {
  return hasProperty(obj, prop) && check(obj[prop]);
}

export function hasPropertyAsTypeOrNull<
  X extends unknown,
  Y extends PropertyKey,
  T
>(
  obj: X | null | undefined,
  prop: Y,
  check: { (arg: unknown): arg is T }
): obj is X & Record<Y, T> {
  return hasProperty(obj, prop) && (obj[prop] === null || check(obj[prop]));
}

export function hasPropertyAsTypeOrUndefined<
  X extends unknown,
  Y extends PropertyKey,
  T
>(
  obj: X | null | undefined,
  prop: Y,
  check: { (arg: unknown): arg is T }
): obj is X & Record<Y, T> {
  return (
    hasProperty(obj, prop) && (obj[prop] === undefined || check(obj[prop]))
  );
}

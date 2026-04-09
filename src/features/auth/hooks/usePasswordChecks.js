import { useMemo } from 'react';
import { passwordChecks } from '../schemas/auth.schema';

export default function usePasswordChecks(password = '') {
  return useMemo(
    () => passwordChecks.map((check) => ({ ...check, passed: check.test(password) })),
    [password],
  );
}

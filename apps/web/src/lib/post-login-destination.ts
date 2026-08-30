import { getPersonSignInPath, isOperatorRole, PERSON_HOME_PATH } from "@promorang/shared";

export { getPersonSignInPath, PERSON_HOME_PATH };

export function getCompletedPersonHome(role?: string | null) {
  if (isOperatorRole(role)) return "/dashboard";
  return PERSON_HOME_PATH;
}

import React from "react";
import { useHistory } from "react-router-dom";

export default function SignUpRedirect() {
  const history = useHistory();
  React.useEffect(() => {
    history.replace("/onboarding");
  }, [history]);
  return null;
}

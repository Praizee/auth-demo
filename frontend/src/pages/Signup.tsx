import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { PasswordField } from "../components/PasswordField";
import { handleNav } from "../lib/navigation";
import { navigate } from "../lib/router";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../lib/validation";

export function SignupPage() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError =
      validateName(firstName) ||
      validateName(lastName) ||
      validateEmail(email) ||
      validatePassword(password);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await signup(firstName.trim(), lastName.trim(), email.trim(), password);
      toast.success("Account created.");
      navigate("/dashboard");
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        try {
          const errorData = JSON.parse(caughtError.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const messages = errorData.errors
              .map((err: { message: string }) => err.message)
              .join(" ");
            setError(messages);
            toast.error(messages);
            return;
          }
        } catch (e) {
          // Not a JSON error from the backend, use the error message directly
        }
      }

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Signup</h1>

        <label htmlFor="signup-firstName">
          First Name
          <input
            autoComplete="given-name"
            id="signup-firstName"
            minLength={2}
            onChange={(event) => setFirstName(event.target.value)}
            required
            value={firstName}
          />
        </label>

        <label htmlFor="signup-lastName">
          Last Name
          <input
            autoComplete="family-name"
            id="signup-lastName"
            minLength={2}
            onChange={(event) => setLastName(event.target.value)}
            required
            value={lastName}
          />
        </label>

        <label htmlFor="signup-email">
          Email
          <input
            autoComplete="email"
            id="signup-email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <PasswordField
          autoComplete="new-password"
          id="signup-password"
          label="Password"
          onChange={setPassword}
          value={password}
        />

        {error && <p className="error">{error}</p>}

        <button disabled={isLoading} type="submit">
          {isLoading ? "Creating..." : "Signup"}
        </button>

        <p>
          Have an account?{" "}
          <a href="/login" onClick={(event) => handleNav(event, "/login")}>
            Login
          </a>
        </p>
      </form>
    </main>
  );
}


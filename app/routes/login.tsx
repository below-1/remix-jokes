import { ActionFunction, json, LinksFunction } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";

import stylesUrl from "../styles/login.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

function validateUsername(username: string) {
  if (typeof username !== 'string' || username.length < 3) {
    return `username must be at least 3 characters long`;
  }
}

function validatePassword(password: string) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Passwords must be at least 6 characters long';
  }
}

function validateUrl(url: any) {
  console.log(url);
  let urls = ["/jokes", "/", "https://remix.run"]
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  },
  fields?: {
    loginType: string;
    username: string;
    password: string;
  }
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 })
}

export const action: ActionFunction = async (options) => {
  const form = await options.request.formData()
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');
  const redirectTo = validateUrl(form.get('redirectTo') || "/jokes");
  if (
    typeof loginType !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return badRequest({
      formError: 'Form must be submitted correctly'
    })
  }
  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password)
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  switch (loginType) {
    case "login": {
      const user = await login({
        username,
        password
      })
      console.log(user)
      if (!user) {
        return badRequest({
          fields,
          formError: `Username/Password combination is incorrect`
        })
      }
      return createUserSession(user.id, redirectTo)
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: {
          username
        }
      })
      if (userExists) {
        return badRequest({
          fields,
          formError: `User "${username}" already exists`
        })
      }
      const user = await register({
        username,
        password
      })
      if (!user) {
        return badRequest({
          fields,
          formError: 'Something went wrong trying to create new user'
        })
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fields,
        formError: 'Login type invalid'
      })
    }
  }
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
            />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
            />
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
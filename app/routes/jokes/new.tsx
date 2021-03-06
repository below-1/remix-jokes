import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from '@remix-run/node';
import { useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return 'the joke is too short';
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return 'name is too short';
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  }
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 })
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const name = form.get('name');
  const content = form.get('content');
  const userId = await requireUserId(request);
  if (
    typeof name !== 'string'
    || typeof content !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly`
    })
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content)
  }
  const fields = {
    name,
    content
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields
    })
  }
  const joke = await db.joke.create({
    data: {
      ...fields,
      jokesterId: userId,
    }
  })
  return redirect(`/jokes/${joke.id}`)
}

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  return (
    <div>
      <p>Add you own hilarious joke</p>
      <form
        method="POST"
      >
        <div>
          <label>
            Name: 
            <input 
              type="text" 
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={actionData?.fieldErrors?.name || undefined}
              name="name" 
            />
          </label>
        </div>
        {actionData?.fieldErrors?.name ? (
          <p 
            className="form-validation-error"
            role="alert"
            id="name-error"
          >
            {actionData.fieldErrors.name}
          </p>
        ) : null}
        <div>
          <label>
            Content: 
            <textarea 
              name="content" 
              defaultValue={actionData?.fields?.content}
              aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
              aria-errormessage={actionData?.fieldErrors?.content || undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p 
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
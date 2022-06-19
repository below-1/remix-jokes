import { Joke } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

type LoaderData = {
  joke: Joke
}

export const loader: LoaderFunction = async (options) => {
  const id = options.params.jokeId
  const data = {
    joke: await db.joke.findFirst({
      where: { id }
    })
  }
  if (!data.joke) throw new Error("Joke not found");
  return json(data);
}

export default function JokeRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
    </div>
  );
}

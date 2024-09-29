import { Link, useLoaderData } from "@remix-run/react";

export const meta = () => {
    return [
        { title: "Fetching Data" },
    ];
};

export const loader = async () => {
    const [todos, posts] = await Promise.all([
        fetch('https://jsonplaceholder.typicode.com/todos').then(res => res.json()),
        fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json())
    ]);
    return { todos, posts };
};

export default function Home() {
    const { todos, posts } = useLoaderData();
    return (
        <div className="w-full min-h-screen p-5">
            <h1 className="text-2xl font-bold text-center my-5">
                Fetching Data
            </h1>

            <div className="flex flex-wrap justify-center gap-10">
                <div className="w-full md:w-1/2 lg:w-1/3 p-4 border rounded shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-4">
                        Todos
                    </h2>
                    <ul className="space-y-2">
                        {todos.map(todo => (
                            <li
                                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                key={todo.id}
                            >
                                <Link to={`/todos/${todo.id}`}>
                                    {todo.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/3 p-4 border rounded shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-4">
                        Posts
                    </h2>
                    <ul className="space-y-2">
                        {posts.map(post => (
                            <li
                                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                key={post.id}
                            >
                                <Link to={`/posts/${post.id}`}>
                                    {post.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

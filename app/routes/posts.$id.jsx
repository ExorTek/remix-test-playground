import { useLoaderData } from "@remix-run/react";

export const meta = () => {
    return [
        { title: "Posts" },
    ];
};

export const loader = async ({ params }) => {
    const id = params.id;
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const post = await res.json();
    return { post };
};

export default function Posts() {
    const { post } = useLoaderData();
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-5">
            <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    {post.title}
                </h1>
                <p className="text-lg text-gray-700">
                    {post.body}
                </p>
            </div>
        </div>
    );
}

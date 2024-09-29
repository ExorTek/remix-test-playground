import { useLoaderData } from "@remix-run/react";

export const meta = () => {
    return [
        { title: "Todos" },
    ];
};

export const loader = async ({ params }) => {
    const id = params.id;
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const todo = await res.json();
    return { todo };
};

export default function Todos() {
    const { todo } = useLoaderData();
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-5">
            <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                    Todo: {todo.title}
                </h1>
                <p className="text-lg text-gray-700">
                    Status: {todo.completed ? 'Completed' : 'Not Completed'}
                </p>
            </div>
        </div>
    );
}

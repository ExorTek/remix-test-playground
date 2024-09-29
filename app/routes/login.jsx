import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
export async function action({request}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const errors = {};
    if (!data.email) {
        errors.email = "Email is required";
    }

    if (!data.password) {
        errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
        return json({errors}, {status: 400});
    }

    const user = {
        email: "admin@admin.com",
        password: "admin"
    }

    if (data.email !== user.email || data.password !== user.password) {
        return json({errors: {email: "Invalid email or password"}}, {status: 400});
    }

    return redirect("/", {
        headers: {
            "Set-Cookie": `auth=true; Path=/; HttpOnly; SameSite=Strict`,
        },
    });
}


export default function Login() {
    const actionData = useActionData();

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Login</h1>
                <Form method={'post'}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-semibold">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                            required
                        />
                        {actionData?.errors?.email && (
                            <span className="text-red-500">{actionData.errors.email}</span>
                        )}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-semibold">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                            required
                        />
                        {actionData?.errors?.password && (
                            <span className="text-red-500">{actionData.errors.password}</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </Form>
            </div>
        </div>
    );
}

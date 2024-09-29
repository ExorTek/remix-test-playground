import {
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useRouteError,
} from "@remix-run/react";

import "./tailwind.css";

export const links = () => [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function Layout({children}) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
            <title> Remix Playground </title>
        </head>
        <body>

        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white font-bold text-xl">Remix Playground</Link>
                <div>
                    <Link to="/client" className="text-white hover:underline ml-4">Client</Link>
                    <Link to="/login" className="text-white hover:underline ml-4">Login</Link>
                </div>
            </div>
        </nav>
        {children}
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function App() {
    return <Outlet/>;
}

export function ErrorBoundary() {
    const error = useRouteError();
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">An error occurred</h1>
                <div className="">
                    <pre className="mt-2 text-center">{error?.status || 'N/A'}</pre>
                    <pre
                        className="">{error?.statusText || 'Unknown error'}</pre>
                </div>
                <Link to="/" className="text-blue-500 hover:text-blue-700 font-medium underline">
                    Go back home
                </Link>
            </div>
        </div>
    );
}

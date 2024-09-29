import Counter from "../components/Counter.jsx";
import { ClientOnly } from "remix-utils/client-only";

function Client() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-5">
            <ClientOnly fallback={<p className="text-lg text-gray-500">
                Loading client-only component...
            </p>}>
                {() => <Counter/>}
            </ClientOnly>
        </div>
    );
}

export default Client;

import { useState } from "react";

const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="p-5 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Increment/Decrement Counter
            </h1>
            <p className="text-lg mb-4">
                Count: <span className="font-semibold text-blue-600">{count}</span>
            </p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setCount(count + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Increment
                </button>
                <button
                    onClick={() => setCount(count - 1)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Decrement
                </button>
            </div>
        </div>
    );
}

export default Counter;

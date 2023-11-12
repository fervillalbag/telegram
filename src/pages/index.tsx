import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Pusher from "pusher-js";

const ChatComponent = () => {
  return (
    <div className="mb-3 cursor-pointer border border-neutral-400 rounded-md p-2">
      <div className="flex justify-between items-center">
        <p className="font-semibold">Fernando Villalba</p>
        <p className="text-sm">10:40</p>
      </div>

      <div>
        <p>Hola Fenando como estas?</p>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const decoded = jwtDecode(
      localStorage.getItem("access_token") as any
    );
    setUser(decoded);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY as string,
      {
        cluster: "us2",
      }
    );

    const channel = pusher.subscribe("testing-chat");
    channel.bind("testing-message", (newMessage: any) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="h-screen relative">
      <div className="absolute items-center bottom-4 left-5 flex justify-between w-[calc(100vw_-_40px)]">
        <p className="font-semibold">{user?.name}</p>
        <button
          onClick={() => {
            localStorage.removeItem("access_token");
            router.push("/login");
          }}
          className="py-1 px-3 border border-neutral-500 rounded-md"
        >
          cerrar sesion
        </button>
      </div>

      <header className="p-5">
        <h1 className="text-2xl">Lista de mensajes</h1>
      </header>

      <main className="px-5">
        <ChatComponent />
        <ChatComponent />
        <ChatComponent />
        <ChatComponent />
        <ChatComponent />
      </main>
    </div>
  );
}

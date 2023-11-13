import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface ChatComponentProps {
  userId: string;
  conversation: string;
  messages: any[];
}

const ChatComponent = ({
  conversation,
  messages,
  userId,
}: ChatComponentProps) => {
  const lastMessage = messages
    ?.filter((message) => {
      return (
        (message.sender?._id === userId &&
          message.receiver?._id === conversation) ||
        (message.sender?._id === conversation &&
          message.receiver?._id === userId)
      );
    })
    .sort(
      (a: any, b: any) =>
        +new Date(b.createdAt) - +new Date(a.createdAt)
    )
    .shift();

  return (
    <div className="mb-3 cursor-pointer border border-neutral-400 rounded-md p-2">
      <div className="flex justify-between items-center">
        <p className="font-semibold">{lastMessage?.sender.name}</p>
        <p className="text-sm">
          {dayjs(lastMessage?.createdAt).format("hh:mm a")}
        </p>
      </div>

      <div>
        <p>{lastMessage?.content}</p>
      </div>
    </div>
  );
};

const getAllMessages = async (userId: string) => {
  const response = await axios({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/message?user1=${userId}`,
  });

  return response.data;
};

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);
    }
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
      if (
        newMessage.receiver !== user?.id &&
        newMessage.sender !== user?.id
      )
        return;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const response = await getAllMessages(user?.id);
      setMessages(response);
    })();
  }, [user]);

  const conversations: any = new Set();

  messages?.forEach((message: any) => {
    if (message.sender !== user?.id) {
      conversations.add(message.sender._id);
    }
    if (message.receiver !== user?.id) {
      conversations.add(message.receiver._id);
    }
  });

  conversations.delete(user?.id);

  const conversationsArray = [...conversations];

  return (
    <div className="h-screen relative">
      <div className="absolute items-center bottom-4 left-5 flex justify-between w-[calc(100vw_-_40px)]">
        <div>
          <p className="font-semibold">{user?.name}</p>
          <span className="block text-xs">{user?.id}</span>
        </div>
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
        {conversationsArray?.map((conversation: any) => (
          <ChatComponent
            userId={user?.id}
            messages={messages}
            key={conversation}
            conversation={conversation}
          />
        ))}
      </main>
    </div>
  );
}

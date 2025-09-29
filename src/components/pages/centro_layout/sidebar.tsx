"use client";

import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
import Image from "next/image";

type SidebarItem = {
    icon: string;
    label: string;
    path: string;
    options: { name: string; path: string }[] | null;
};

type SidebarProps = {
    title: string;
    items: SidebarItem[];
};

export default function Sidebar({ items }: SidebarProps) {
    const router = useRouter();

    return (
        <aside className="text-white h-screen w-60 flex flex-col shadow-lg rounded-tr-4xl mt-1.25" style={{ backgroundColor: "#0C645A", height: "100vh" }} >
        {/* Logo grande */}
        <div className="flex items-center justify-center p-6 border-b border-teal-700">
            <Image
            src="/isologotipo-fc-white.png" // logo grande
            alt="Logo"
            width={120}
            height={120}
            className="object-contain"
            />
        </div>

        {/* Lista de opciones */}
        <nav className="mt-6 flex flex-col gap-1 px-2">
            {items.map((item, index) => (
            <div
                key={index}
                className={classNames(
                "flex items-center gap-3 py-3 px-4 cursor-pointer transition-all duration-200 ease-in-out rounded-xl hover:bg-[#0F7E72] hover:translate-x-1"
                )}
                onClick={() => router.push(item.path)}
            >
                <i className={classNames("pi", item.icon)}></i>
                <span>{item.label}</span>
            </div>
            ))}
        </nav>
        </aside>
    );
}

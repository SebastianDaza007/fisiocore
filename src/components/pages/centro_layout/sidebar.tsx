"use client";

import { useRouter, usePathname } from "next/navigation";
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
    const pathname = usePathname();

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
            {items.map((item, index) => {
                // Verificar si hay un ítem más específico que coincida mejor
                const hasMoreSpecificMatch = items.some(
                    otherItem => otherItem.path !== item.path &&
                                 otherItem.path.length > item.path.length &&
                                 (pathname === otherItem.path || pathname.startsWith(otherItem.path + '/'))
                );

                const isActive = (pathname === item.path || pathname.startsWith(item.path + '/')) && !hasMoreSpecificMatch;

                return (
                    <div
                        key={index}
                        className={classNames(
                            "flex items-center gap-3 py-3 px-4 cursor-pointer transition-all duration-300 ease-out rounded-xl transform",
                            {
                                "bg-white/20 backdrop-blur-sm shadow-lg border border-white/30": isActive,
                                "hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-white/20": !isActive
                            }
                        )}
                        onClick={() => router.push(item.path)}
                    >
                        <i className={classNames("pi", item.icon, "transition-all duration-300", {
                            "text-white font-bold": isActive,
                            "text-gray-200": !isActive
                        })}></i>
                        <span className={classNames("transition-all duration-300", {
                            "font-semibold text-white": isActive,
                            "text-gray-200": !isActive
                        })}>{item.label}</span>
                    </div>
                )
            })}
        </nav>
        </aside>
    );
}

"use client";

import { User } from "@/lib/infrastructure/db/schema";
import { motion } from "framer-motion";
import { Mail, User as UserIcon, Shield, Calendar } from "lucide-react";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const items = [
    {
      icon: <Mail className="w-4 h-4" />,
      label: "メールアドレス",
      value: user.email,
    },
    {
      icon: <UserIcon className="w-4 h-4" />,
      label: "名前",
      value: user.name || "未設定",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: "ロール",
      value: user.role,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "アカウント作成日",
      value: user.createdAt.toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group"
        >
          <div className="grid gap-2 group-hover:bg-orange-50/50 dark:group-hover:bg-orange-500/5 p-3 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <div className="text-orange-500/70 dark:text-orange-400/70">
                {item.icon}
              </div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {item.label}
              </label>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{item.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

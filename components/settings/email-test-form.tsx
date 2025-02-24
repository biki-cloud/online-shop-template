"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { testEmail } from "@/app/actions/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

type FormData = z.infer<typeof formSchema>;

export function EmailTestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      await testEmail(data);
      toast.success("テストメールを送信しました", {
        description: "メールが届くまでしばらくお待ちください",
      });
      form.reset();
    } catch (error) {
      toast.error("エラーが発生しました", {
        description: "メール送信に失敗しました。設定を確認してください。",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>メール送信テスト</CardTitle>
        <CardDescription>
          メール設定が正しく機能しているか確認するために、テストメールを送信できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>送信先メールアドレス</FormLabel>
                  <FormControl>
                    <Input placeholder="test@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "送信中..." : "テストメールを送信"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

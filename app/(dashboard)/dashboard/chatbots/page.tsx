import { redirect } from "next/navigation";
import { Chatbot, ChatbotModel } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { DashboardHeader } from "@/components/header";
import { DashboardShell } from "@/components/shell";
import { ChatbotCreateButton } from "@/components/chatbot-create-button";
import { ChatbotItem } from "@/components/chatbot-item";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `${siteConfig.name} - Chatbots`,
};

type ChatbotWithModel = {
  chatbot: Pick<
    Chatbot,
    "id" | "name" | "createdAt" | "modelId" | "openaiId" | "isImported"
  >;
  model: ChatbotModel | null;
};

export default async function ChatbotsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login");
  }

  let bots: ChatbotWithModel[] = [];
  try {
    const botsData = await db.chatbot.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        modelId: true,
        openaiId: true,
        isImported: true,
        model: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    bots = botsData.map((bot) => ({
      chatbot: {
        id: bot.id,
        name: bot.name,
        createdAt: bot.createdAt,
        modelId: bot.modelId,
        openaiId: bot.openaiId,
        isImported: bot.isImported,
      },
      model: bot.model,
    }));
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    // Handle the error appropriately, maybe set an error state
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Chatbots"
        text="Create and manage your chatbots."
      >
        <ChatbotCreateButton />
      </DashboardHeader>
      <div>
        {bots.length ? (
          <div className="divide-y divide-border rounded-md border">
            {bots.map(({ chatbot, model }) => (
              <ChatbotItem
                key={chatbot.id}
                chatbot={chatbot}
                model={model as ChatbotModel}
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="bot" />
            <EmptyPlaceholder.Title>No chatbot created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any chatbot yet. Start creating.
            </EmptyPlaceholder.Description>
            <ChatbotCreateButton variant="outline" />
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  );
}

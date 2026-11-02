import { Chat } from "./Chat";

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">AI işletme asistanı</h1>
      <p className="mb-6 text-sm text-stone-500">
        Satışlarınız, menünüz ve müşterileriniz hakkında soru sorun. Asistan gerçek verilerinize bakarak cevap verir ve isterseniz kampanya taslağı hazırlar.
      </p>
      <Chat />
    </div>
  );
}

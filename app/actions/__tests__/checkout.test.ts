import { handleCheckout } from "../checkout";
import { getSessionService, getPaymentService } from "@/lib/di/container";

// モックの設定
jest.mock("@/lib/di/container", () => ({
  getSessionService: jest.fn(),
  getPaymentService: jest.fn(),
}));

describe("checkout actions", () => {
  // モックサービス
  const mockSessionService = {
    get: jest.fn(),
  };

  const mockPaymentService = {
    processCheckout: jest.fn(),
  };

  // 各テスト前のセットアップ
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの戻り値を設定
    (getSessionService as jest.Mock).mockReturnValue(mockSessionService);
    (getPaymentService as jest.Mock).mockReturnValue(mockPaymentService);
  });

  it("セッションがある場合、支払い処理を行うこと", async () => {
    // セッションが存在するケースをモック
    mockSessionService.get.mockResolvedValue({ userId: 1, role: "user" });

    await handleCheckout();

    // 適切なサービスメソッドが呼び出されたか確認
    expect(mockSessionService.get).toHaveBeenCalled();
    expect(mockPaymentService.processCheckout).toHaveBeenCalledWith(1);
  });

  it("セッションがない場合、何も処理しないこと", async () => {
    // セッションが存在しないケースをモック
    mockSessionService.get.mockResolvedValue(null);

    await handleCheckout();

    // セッションの確認は行われるが、支払い処理は行われないこと
    expect(mockSessionService.get).toHaveBeenCalled();
    expect(mockPaymentService.processCheckout).not.toHaveBeenCalled();
  });
});

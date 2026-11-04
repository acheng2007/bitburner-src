import { Terminal } from "../../../src/Terminal";

describe("Terminal timed actions", () => {
  afterEach(() => {
    jest.useRealTimers();
    Terminal.outputHistory = [];
    Terminal.action = null;
  });

  it("prints a full progress bar when the action completes", async () => {
    jest.useFakeTimers();
    jest.spyOn(performance, "now").mockReturnValue(0);
    const onDone = jest.fn();

    const action = Terminal.timedAction(1, "test", onDone);
    const finished = action.finished;
    await jest.advanceTimersByTimeAsync(1000);
    await finished;

    expect(Terminal.outputHistory.at(-1)).toMatchObject({
      text: `[${"|".repeat(50)}]`,
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("prints the partial progress and cancellation message when cancelled", async () => {
    jest.useFakeTimers();
    jest.spyOn(performance, "now").mockReturnValueOnce(0).mockReturnValueOnce(100);
    const onDone = jest.fn();

    const action = Terminal.timedAction(1, "test", onDone);
    const finished = action.finished;
    action.cancel();

    await expect(finished).rejects.toThrow("Terminal command test was cancelled");
    expect(Terminal.outputHistory.at(-2)).toMatchObject({ text: `[${"|".repeat(5)}${"-".repeat(45)}]` });
    expect(Terminal.outputHistory.at(-1)).toMatchObject({ text: "Cancelled test" });
    expect(onDone).not.toHaveBeenCalled();
  });
});

import fs from "fs";

describe("Program testing of exams interactions", function () {
  beforeAll(function () {});

  it("should create an exam from a GIFT file", async function () {
    const { createExam } = await import("../src/exam.js");
    await createExam(
      "unitTestExam",
      [
        "U6 p62 Reading 2",
        "U6 p62 Reading 4",
        "U6 p63 Reading Voc6.A1",
        "U6 p63 Reading Voc6.A2",
        "U6 p63 Reading Voc6.A3",
        "U6 p63 Reading Voc6.A4",
        "U6 p63 Reading Voc6.A5",
        "U6 p63 Reading Voc6.A6",
        "U6 p63 Reading Voc6.A7",
        "U6 p63 Reading Voc6.A8",
        "U6 p63 Reading Voc6.A9",
        "U6 p63 Reading Voc6.B1",
        "U6 p63 Reading Voc6.B2",
        "U6 p63 Reading Voc6.B3",
        "U6 p63 Reading Voc6.B4",
        "U6 p63 Reading Voc6.B5",
        "U6 p63 Reading Voc6.B6",
        "U6 p63 Reading Voc6.B7",
      ],
      "User1"
    );

    expectAsync(() =>
      fs.promises.access("./res/examCreated/unitTestExam.gift")
    ).not.toThrow();
  });
});

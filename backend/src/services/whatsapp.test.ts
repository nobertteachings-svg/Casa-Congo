import { describe, expect, it } from "vitest";
import { parseWebhookPayload, resolveWhatsAppSenderPhone } from "../services/whatsapp.js";

describe("WhatsApp webhook parsing", () => {
  it("returns empty array for invalid payload", () => {
    expect(parseWebhookPayload({})).toEqual([]);
    expect(parseWebhookPayload(null)).toEqual([]);
    expect(parseWebhookPayload(undefined)).toEqual([]);
  });

  it("parses text messages", () => {
    const messages = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: "243810000001", profile: { name: "Ada" } }],
                messages: [
                  {
                    from: "243810000001",
                    id: "msg-1",
                    timestamp: "123",
                    type: "text",
                    text: { body: "hello casa" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      from: "243810000001",
      type: "text",
      text: "hello casa",
      name: "Ada",
    });
  });

  it("parses location pins", () => {
    const messages = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "243810000002",
                    id: "loc-1",
                    timestamp: "456",
                    type: "location",
                    location: { latitude: 3.848, longitude: 11.5021 },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(messages[0]).toMatchObject({
      type: "location",
      latitude: 3.848,
      longitude: 11.5021,
    });
  });

  it("parses image and video media ids", () => {
    const messages = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "243810000003",
                    id: "img-1",
                    timestamp: "1",
                    type: "image",
                    image: { id: "image-media-id" },
                  },
                  {
                    from: "243810000003",
                    id: "vid-1",
                    timestamp: "2",
                    type: "video",
                    video: { id: "video-media-id" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(messages[0]).toMatchObject({ type: "image", imageId: "image-media-id" });
    expect(messages[1]).toMatchObject({ type: "video", videoId: "video-media-id" });
  });

  it("parses interactive button and list replies with choice id", () => {
    const button = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "243810000004",
                    id: "btn-1",
                    timestamp: "1",
                    type: "interactive",
                    interactive: { type: "button_reply", button_reply: { id: "1", title: "Search" } },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(button[0]).toMatchObject({ type: "interactive", text: "1", choiceId: "1" });

    const list = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "243810000005",
                    id: "list-1",
                    timestamp: "2",
                    type: "interactive",
                    interactive: { type: "list_reply", list_reply: { id: "3", title: "More options" } },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(list[0]).toMatchObject({ type: "interactive", text: "3", choiceId: "3" });
  });

  it("uses contacts.wa_id when messages.from is a LID (WhatsApp vs Business)", () => {
    const resolved = resolveWhatsAppSenderPhone("123456789012345678", [
      { wa_id: "243812345678", profile: { name: "Biz" } },
    ]);
    expect(resolved.phone).toBe("243812345678");

    const messages = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: "243812345678", profile: { name: "Biz" } }],
                messages: [
                  {
                    from: "123456789012345678",
                    id: "lid-1",
                    timestamp: "1",
                    type: "text",
                    text: { body: "CASA-APP-LOGIN" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(messages[0]?.from).toBe("243812345678");
  });

  it("canonicalizes a 08 wa_id so it matches the app-entered +243 number", () => {
    const messages = parseWebhookPayload({
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: "0812345678" }],
                messages: [
                  {
                    from: "0812345678",
                    id: "local-1",
                    timestamp: "1",
                    type: "text",
                    text: { body: "CASA-APP-LOGIN" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(messages[0]?.from).toBe("243812345678");
  });
});

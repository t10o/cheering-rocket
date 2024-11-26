import { Meta, StoryObj } from "@storybook/react";
import { Spacer } from "./Spacer";

const meta: Meta<typeof Spacer> = {
  title: "ui/Spacer",
  component: Spacer,
};

export default meta;

type Story = StoryObj<typeof Spacer>;

export const Default: Story = {
  args: {
    tag: "span",
    size: "medium",
  },
  render: (args) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ backgroundColor: "#FF8F1F", width: 50, height: 50 }}>
          Box 1
        </div>
        <Spacer {...args} />
        <div style={{ backgroundColor: "#1F8FFF", width: 50, height: 50 }}>
          Box 2
        </div>
      </div>
    );
  },
};

export const Large: Story = {
  args: {
    size: "large",
  },
  render: (args) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ backgroundColor: "#FF8F1F", width: 50, height: 50 }}>
          Box 1
        </div>
        <Spacer {...args} />
        <div style={{ backgroundColor: "#1F8FFF", width: 50, height: 50 }}>
          Box 2
        </div>
      </div>
    );
  },
};

export const Small: Story = {
  args: {
    size: "small",
  },
  render: (args) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ backgroundColor: "#FF8F1F", width: 50, height: 50 }}>
          Box 1
        </div>
        <Spacer {...args} />
        <div style={{ backgroundColor: "#1F8FFF", width: 50, height: 50 }}>
          Box 2
        </div>
      </div>
    );
  },
};

export const XSmall: Story = {
  args: {
    size: "xsmall",
  },
  render: (args) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ backgroundColor: "#FF8F1F", width: 50, height: 50 }}>
          Box 1
        </div>
        <Spacer {...args} />
        <div style={{ backgroundColor: "#1F8FFF", width: 50, height: 50 }}>
          Box 2
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  args: {
    tag: "div",
    direction: "vertical",
  },
  render: (args) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ backgroundColor: "#FF8F1F", width: 50, height: 50 }}>
          Box 1
        </div>
        <Spacer {...args} />
        <div style={{ backgroundColor: "#1F8FFF", width: 50, height: 50 }}>
          Box 2
        </div>
      </div>
    );
  },
};

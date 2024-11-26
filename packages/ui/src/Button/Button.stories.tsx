import { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

// 基本ストーリー
export const Default: Story = {
  args: {
    label: "Default Button",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Button with Icon",
    icon: faCoffee,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Button",
    disabled: true,
  },
};

// Contained バリアント
export const ContainedPrimary: Story = {
  args: {
    label: "Contained Primary",
    variant: "contained",
    color: "primary",
  },
};

export const ContainedDanger: Story = {
  args: {
    label: "Contained Danger",
    variant: "contained",
    color: "danger",
  },
};

export const ContainedWarning: Story = {
  args: {
    label: "Contained Warning",
    variant: "contained",
    color: "warning",
  },
};

export const ContainedInfo: Story = {
  args: {
    label: "Contained Info",
    variant: "contained",
    color: "info",
  },
};

// Outlined バリアント
export const OutlinedPrimary: Story = {
  args: {
    label: "Outlined Primary",
    variant: "outlined",
    color: "primary",
  },
};

export const OutlinedDanger: Story = {
  args: {
    label: "Outlined Danger",
    variant: "outlined",
    color: "danger",
  },
};

export const OutlinedWarning: Story = {
  args: {
    label: "Outlined Warning",
    variant: "outlined",
    color: "warning",
  },
};

export const OutlinedInfo: Story = {
  args: {
    label: "Outlined Info",
    variant: "outlined",
    color: "info",
  },
};

// Text バリアント
export const TextPrimary: Story = {
  args: {
    label: "Text Primary",
    variant: "text",
    color: "primary",
  },
};

export const TextText: Story = {
  args: {
    label: "Text Text",
    variant: "text",
    color: "text",
  },
};

export const TextDanger: Story = {
  args: {
    label: "Text Danger",
    variant: "text",
    color: "danger",
  },
};

export const TextWarning: Story = {
  args: {
    label: "Text Warning",
    variant: "text",
    color: "warning",
  },
};

export const TextInfo: Story = {
  args: {
    label: "Text Info",
    variant: "text",
    color: "info",
  },
};

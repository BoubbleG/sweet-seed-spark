import type { Order, Restaurant } from "@/types";
import { buildReceiptBytes } from "./escpos";

// Standard "serial over GATT" used by most cheap ESC/POS thermal printers
// (Goojprt, MTP, MPT-II, Xprinter, generic 58mm Bluetooth printers).
const PRINTER_SERVICE = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC = "00002af1-0000-1000-8000-00805f9b34fb";
const CHUNK = 100;

type BTDevice = any;
type BTChar = any;

let device: BTDevice | null = null;
let characteristic: BTChar | null = null;

export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function isPrinterConnected(): boolean {
  return !!(device && device.gatt && device.gatt.connected && characteristic);
}

export function getConnectedPrinterName(): string | null {
  return device?.name ?? null;
}

async function connectGatt(d: BTDevice): Promise<BTChar> {
  const server = await d.gatt.connect();
  const service = await server.getPrimaryService(PRINTER_SERVICE);
  const char = await service.getCharacteristic(PRINTER_CHARACTERISTIC);
  return char;
}

export async function requestPrinter(): Promise<string> {
  if (!isBluetoothSupported()) {
    throw new Error(
      "Seu navegador não suporta Bluetooth. Use Chrome no Android ou no PC.",
    );
  }
  // Show all nearby devices but require the printer service so we can talk to it.
  device = await (navigator as any).bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [PRINTER_SERVICE],
  });
  device.addEventListener("gattserverdisconnected", () => {
    characteristic = null;
  });
  characteristic = await connectGatt(device);
  return device.name ?? "Impressora";
}

async function ensureConnected() {
  if (!device) throw new Error("Nenhuma impressora conectada.");
  if (!device.gatt.connected || !characteristic) {
    characteristic = await connectGatt(device);
  }
}

async function writeBytes(bytes: Uint8Array) {
  await ensureConnected();
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.slice(i, i + CHUNK);
    // writeValueWithoutResponse is faster but not all printers support it
    if (characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
  }
}

export async function printOrderBluetooth(restaurant: Restaurant, order: Order) {
  const bytes = buildReceiptBytes(restaurant, order);
  await writeBytes(bytes);
}

export function disconnectPrinter() {
  try {
    if (device?.gatt?.connected) device.gatt.disconnect();
  } catch {
    /* ignore */
  }
  device = null;
  characteristic = null;
}
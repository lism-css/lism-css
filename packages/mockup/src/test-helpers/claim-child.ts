/**
 * 実プロセス間の占有競合テスト（`core/cache-claim.concurrency.test.ts`）で使う子プロセス。
 *
 * 前方式（ロックファイル）の欠陥は複数プロセスの交錯でしか出なかったため、同一プロセスの
 * 単体テストとは別に、実際に別 pid のプロセスを同時に走らせて確かめる。
 *
 * 親との手順（stdout へ JSON 1行ずつ）:
 *   1. 起動を知らせる（`{"ready":true}`）
 *   2. 親が作る start ファイルを待ち、一斉に `claimViteCacheDir()` を呼ぶ
 *   3. 取得結果を報告する（`{"pid":..,"claimed":..,"dir":..,"marker":..}`）
 *   4. 親が作る release ファイルを待ち、返却して終了する
 *
 * 親が落ちても取り残されないよう、待機には必ず期限を設ける。
 */
import fs from 'node:fs';
import path from 'node:path';

import { claimViteCacheDir } from '../core/cache-claim.js';

/** 合図のファイルが現れるまで待つ（期限切れでも進む。ハングさせない）。 */
function waitForSignal(signalPath: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const timer = setInterval(() => {
      if (!fs.existsSync(signalPath) && Date.now() < deadline) return;
      clearInterval(timer);
      resolve();
    }, 5);
  });
}

/** 占有したディレクトリが持つ目印（引き継ぎの追跡用）。 */
function readMarker(dir: string): string | null {
  try {
    return fs.readFileSync(path.join(dir, 'marker.txt'), 'utf-8');
  } catch {
    return null;
  }
}

const [sharedPath, startSignal, releaseSignal] = process.argv.slice(2);
if (!sharedPath || !startSignal || !releaseSignal) {
  console.error('usage: claim-child.ts <sharedPath> <startSignal> <releaseSignal>');
  process.exit(1);
}

console.log(JSON.stringify({ ready: true, pid: process.pid }));
await waitForSignal(startSignal, 20_000);

const claim = claimViteCacheDir(sharedPath);
console.log(
  JSON.stringify({
    pid: process.pid,
    claimed: claim !== null,
    dir: claim?.dir ?? null,
    marker: claim === null ? null : readMarker(claim.dir),
  })
);

// 全子の占有が重なっている状態を親が観測できるよう、指示があるまで持ったままにする。
await waitForSignal(releaseSignal, 20_000);
claim?.release();

import SMSDemo from "../components/SMSDemo";

export default function SMSPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">SMS Demo Preview</h1>
        <p className="text-blue-200 mb-8">Watch the animated conversation loop</p>
        <SMSDemo />
        <p className="text-blue-300 mt-8 text-sm">Animation loops every ~14 seconds</p>
      </div>
    </div>
  );
}

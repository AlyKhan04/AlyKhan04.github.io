//Hero banner component from react - to display name, goals, and tagline
import profile from "../assets/profile.jpeg"
export default function Hero(){
    return(
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4 bg-black/60">
            <img
                src={profile}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 shadow-md border-4 border-white"
            />
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">
                Aly Shahbaz Aftab Khan
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gray-600">
                Computer Science Graduate
            </p>
            <p className="mt-2 max-w-xl text-gray-500">
                Passionate about building intelligent systems, solving real-world problems, and crafting useful, elegant software.
            </p>
            <div className="mt-6 flex gap-4">
                <a
                    href="#projects"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    View Projects
                </a>
                <a
                    href={`${process.env.PUBLIC_URL}/docs/AlyKhanCV.pdf`}  // ✅ works on GH Pages
                    download="AlyKhanCV.pdf"
                    type="application/pdf"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                    Download CV
                </a>
            </div>
        </div>
    );
}
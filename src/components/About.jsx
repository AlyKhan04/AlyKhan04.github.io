// About who I am
import React from 'react'; 
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import SongOfTheMonth from './SongOfTheMonth';

const About = () => {
  return (
    <section id="about" className="text-white py-16 px-4 sm:px-8 lg:px-16 bg-black min-h-screen">
     <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">

        {/* Welcome Box */}
        <div className="col-span-2 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <p className="text-xs uppercase text-gray-400 mb-2">welcome</p>
          <h2 className="text-2xl font-semibold mb-2">Hi, I'm Aly Shahbaz Aftab Khan.</h2>
          <p className="text-gray-300">
            A recent computer science with Artificial Intelligence Graduate from the University of Nottingham. I love experimenting with different Machine Learning techniques and datasets on Kaggle. I'm especially interested in Human-AI conversational loops and exploring techniques to maintain context in LLM's. 
          </p>
          <br />
          <p className="text-gray-300">
            Please reach out if you'd like to work on a project together or even just to chat!
          </p>

          {/* Social Buttons */}
          <div className="mt-6 flex gap-4">
            <a
              href="https://www.linkedin.com/in/aly-khan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              <FaLinkedin />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://github.com/alykhan04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              <FaGithub />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* About Me */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-xl font-semibold mb-2">About me</h3>
          <ul className="list-disc list-inside text-gray-300 text-sm">
            <p className="text-gray-400 mt-4 text-sm">
                I have experience in the following languages/frameworks/libraries:
            </p>
            <br></br>
            <li>Python</li>
            <li>React / Tailwind (shhh... it's what powers this site)</li>
            <li>Java</li>
            <li>HTML/CSS/JS</li>
            <li>Pytorch/Scikit-Learn/Langchain</li>
          </ul>
          <p className="text-gray-400 mt-4 text-sm">
            Beyond coding, I enjoy volunteering at charities, building lego during my free time, and love watching basketball.
          </p>
        </div>

        {/* What's Next Box */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-xl font-semibold mb-2">What's Next</h3>
          <p className="text-gray-300 text-sm">
            Looking for full-time work
          </p>
          <div className="mt-2 flex items-center">
            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-xs text-gray-400">Available to chat</span>
          </div>
        </div>

        {/* Let's Start Working */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Let's work together!</h3>
          <p className="text-gray-400 text-sm mb-3">Reach out at:</p>
          <p className="text-sm text-blue-400 mb-1">alyshahbazkhan@gmail.com</p>
          <p className="text-gray-500 text-xs"> London, United Kingdom 🇬🇧 </p>
          <div className="mt-4 space-y-1 text-sm text-gray-300">
            <a
                href="https://www.linkedin.com/in/aly-khan/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors duration-200"
            >
                LinkedIn
            </a>
            <br></br>
            <a
                href="https://github.com/alykhan04"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors duration-200"
            >
                GitHub
            </a>
           </div>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
            <SongOfTheMonth />
        </div>
      </div>
    </section>
  );
};

export default About;

import React from 'react';
import { FaTools, FaRocket, FaLaptopCode, FaLock } from 'react-icons/fa';

const About = () => {
  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="display-4 fw-bold">About Tool Website</h1>
          <div className="divider-custom my-4">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <FaTools className="text-primary" />
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <p className="lead">
            Tool Website provides free, easy-to-use online tools to help with everyday tasks.
            From compressing media files to editing PDFs, our goal is to make powerful tools 
            accessible to everyone without the need for expensive software.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-scale">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-primary bg-gradient text-white rounded-3 mb-4 d-inline-flex p-3">
                <FaRocket size={28} />
              </div>
              <h3>Our Mission</h3>
              <p className="mb-0">
                To create high-quality, accessible web tools that solve real problems. 
                We believe powerful utilities should be available to everyone, regardless 
                of technical skill or budget.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-scale">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-primary bg-gradient text-white rounded-3 mb-4 d-inline-flex p-3">
                <FaLaptopCode size={28} />
              </div>
              <h3>How It Works</h3>
              <p className="mb-0">
                Our tools process your files directly in your browser when possible, 
                or through secure servers when additional processing power is needed. 
                This gives you the convenience of web apps with the performance of desktop software.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-scale">
            <div className="card-body text-center p-4">
              <div className="feature-icon bg-primary bg-gradient text-white rounded-3 mb-4 d-inline-flex p-3">
                <FaLock size={28} />
              </div>
              <h3>Privacy & Security</h3>
              <p className="mb-0">
                We take your privacy seriously. Many of our tools work entirely in your browser, 
                meaning your files never leave your computer. When server processing is needed, 
                files are encrypted in transit and promptly deleted after processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Frequently Asked Questions</h2>
              
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingOne">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      Are these tools really free?
                    </button>
                  </h3>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes! All the tools on our website are completely free to use. There are no hidden charges or subscription fees.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      Is there a limit to how many files I can process?
                    </button>
                  </h3>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      There are some reasonable limits in place to ensure the service runs smoothly for everyone. Most tools have a file size limit of 100MB per file, and you can process up to 20 files at once.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingThree">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                      Do you store my files?
                    </button>
                  </h3>
                  <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      For tools that require server-side processing, your files are temporarily stored while being processed, then promptly deleted. Most files are removed within an hour of processing, and we never access or use your content for any purpose.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h3 className="accordion-header" id="headingFour">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                      Can I suggest a new tool?
                    </button>
                  </h3>
                  <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Absolutely! We're always looking to expand our collection of tools. If you have a suggestion, please visit our <a href="/contact" className="text-decoration-none">Contact page</a> and let us know what you'd like to see.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

"use client"
import NavBar from "./ui/navbar";
import Image from "next/image";
import Script from "next/script";

export default function Home() {
  return (
    <div>
      <NavBar />
      <section id="homepage" className="bg-white block">
          <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
              <a href="#" className="inline-flex justify-between items-center py-1 px-1 pe-4 mb-7 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
                  <span className="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 me-3">New</span> <span id="new_badge_pc" className="text-sm font-medium">We help you find the perfect travel destination using AI</span> <span id="new_badge_mobile" className="text-sm font-medium hidden">Try our improved search using AI</span> 
              </a>

              <div className="flex justify-center">
                <Image src="/map.png" alt="Map icon" width={200} height={200} className="block mx-auto w-[130px] my-[30px]"/>
              </div>
              
              <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">Discover thousands of attractions and places to visit</p>
              <form id="searchForm" className="mx-auto w-[70%] mt-[80%]" onsubmit="handleSearch(event)">   
                  <div className="relative">
                      <div className="absolute inset-y-0 rtl:inset-x-0 start-0 flex items-center ps-3.5 pointer-events-none">
                          <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                          </svg>
                      </div>
                      <input spellcheck="false" type="text" id="search_box" className="block w-full p-4 ps-10 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pl-[50px]" placeholder="Where do you want to go?" required />
                      <button id="main_search_submit" type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                  </div>
              </form>
          </div>



      </section>

      <section id="results" className="bg-white w-[70%] hidden mx-auto mt-[39px]">

          {/*<form autocomplete="off" className="w-full mx-auto" style="width: 100%;margin-top: 70px;">   
              <div className="relative">
                  <div className="absolute inset-y-0 rtl:inset-x-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                  </div>
                  <input spellcheck="false" type="text" id="search_box_result" className="block w-full p-4 ps-10 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="What are you looking for?" style="font-size: 18px;padding-left: 50px;" required />
              </div>
          </form>*/}

          <div className="mt-4 p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 flex items-center" role="alert" >
              <div className="flex -space-x-4 rtl:space-x-reverse">
                          <img className="bg-white p-1 w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/wikipedia.webp" alt="" />
                          <img className="bg-white p-1 w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/google.png" alt="" />
                          <img className="bg-white p-1 w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/gemini.png" alt="" />
              </div>
              <span className="ml-[20px] mr-1 font-medium">Searching</span> <i id="old_query_text"> - from possible destinations</i>
          </div>

        
      <div id="pages_overview" className="flex items-stretch">

  <div id="dest_list" className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700 h-full">
      <h5 className="mb-3 text-base font-semibold text-gray-900 md:text-xl dark:text-white">
      Destinations
      </h5>
      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Select the city you&aposll be travelling</p>
      <ul className="my-4 space-y-3">
      {/* Skeleton cards */}
      <li>
      <div className="flex items-center py-3 px-3 text-base font-bold text-gray-900 rounded-lg border border-gray-200">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 ms-3 flex items-center">
              <div className="h-3.5 bg-gray-200 rounded-full w-44 animate-pulse"></div>
          </div>
          <div className="inline-flex items-center justify-center px-2 py-0.5 ms-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
          </div>
      </div>
      </li>
      <li>
      <div className="flex items-center py-3 px-3 text-base font-bold text-gray-900 rounded-lg border border-gray-200">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 ms-3 flex items-center">
              <div className="h-3.5 bg-gray-200 rounded-full w-40 animate-pulse"></div>
          </div>
          <div className="inline-flex items-center justify-center px-2 py-0.5 ms-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
          </div>
      </div>
      </li>
      <li>
      <div className="flex items-center py-3 px-3 text-base font-bold text-gray-900 rounded-lg border border-gray-200">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 ms-3 flex items-center">
              <div className="h-3.5 bg-gray-200 rounded-full w-44 animate-pulse"></div>
          </div>
          <div className="inline-flex items-center justify-center px-2 py-0.5 ms-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
          </div>
      </div>
      </li>
      <li>
      <div className="flex items-center py-3 px-3 text-base font-bold text-gray-900 rounded-lg border border-gray-200">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 ms-3 flex items-center">
              <div className="h-3.5 bg-gray-200 rounded-full w-40 animate-pulse"></div>
          </div>
          <div className="inline-flex items-center justify-center px-2 py-0.5 ms-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
          </div>
      </div>
      </li>
          <li>
      <div className="flex items-center py-3 px-3 text-base font-bold text-gray-900 rounded-lg border border-gray-200">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 ms-3 flex items-center">
              <div className="h-3.5 bg-gray-200 rounded-full w-44 animate-pulse"></div>
          </div>
          <div className="inline-flex items-center justify-center px-2 py-0.5 ms-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
          </div>
      </div>
      </li>

      </ul>
      <div>
      <button data-popover-target="destinations-info" type="button" className="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400">
      <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.529 7.988a2.502 2.502 0 0 1 5 .191A2.441 2.441 0 0 1 10 10.582V12m-.01 3.008H10M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
      How are these destinations chosen?</button>
      <div data-popover id="destinations-info" role="tooltip" className="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
          <div className="px-3 py-2">
              <p>Destinations are ranked using an AI model based on your search criteria. Please note that there may be inaccuracies in the results.</p>
          </div>
          <div data-popper-arrow></div>
      </div>
      </div>
      </div>


      {/* City Overview Card (placeholder shown until a city is selected) */}

      <div id="city_overview_empty" className="ml-[20px] min-h-18 w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-full flex items-center justify-center">
          <div id="city_empty_content" className="flex flex-col items-center text-center gap-3 py-12 px-6">
              <Image id="city_empty_image" src="/map.png" className="rounded-md object-contain h-[48px] w-auto" alt="Map" />
              <div id="city_empty_copy" className="mt-[20px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select a destination</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose a city from the left to get started</p>
              </div>
          </div>
      </div>

      {/* City Overview Card (hidden until selection) */}

      <div id="city_overview" className="ml-[20px] hidden min-h-18 w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
          
          {/* City Image (tuned height to align with left skeleton cards) */}
          <div id="city_header" className="relative flex-none">
              {/* tuned height to stay proportional to the left column list */}
              <Image id="city_image" className="rounded-t-lg w-full object-cover h-7" src="/gray.png" alt="City view" />
              {/* Subtle gradient overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-lg pointer-events-none"></div>
          </div>

      {/* City Information */}
      <div id="city_info" className="p-5 pb-4 flex-1 flex flex-col overflow-auto">
              <div>
                  <div className="mb-3">
                      <h5 id="city_about_heading" className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Paris</h5>
                      <p id="city_description" className="mb-3 font-normal text-gray-700 dark:text-gray-400 overflow-hidden line-clamp-3" style={{"display": "-webkit-box"}}>
                          The City of Light captivates visitors with its iconic Eiffel Tower, world-className museums like the Louvre, 
                          charming cafés along the Seine, and stunning architecture.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <a id="city_wiki_box" href="#" target="_blank" rel="noopener" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700 transition hover:bg-blue-100 dark:hover:bg-gray-600">
                          <Image className="w-8 h-8 text-blue-600 mb-1" src="/wikipedia.png" alt="Wikipedia Logo" />
                          <span className="text-xs text-gray-500 dark:text-gray-300">Wikipedia</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Open article</span>
                      </a>
                      <a id="city_map_box" href="#" target="_blank" rel="noopener" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700 transition hover:bg-blue-100 dark:hover:bg-gray-600">
                          <Image className="w-8 h-8 text-blue-600 mb-1" src="/location.png" alt="Maps Icon" />
                          <span className="text-xs text-gray-500 dark:text-gray-300">Maps</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">View location</span>
                      </a>
                      <div id="city_country_box" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700 cursor-default">
                          <Image className="w-8 h-8 text-blue-600 mb-1" src="/globe.png" alt="Globe Icon" />
                          <span className="text-xs text-gray-500 dark:text-gray-300">Country</span>
                          <span id="city_country_box_label" className="text-sm font-semibold text-gray-900 dark:text-white">Learn more</span>
                      </div>
                  </div>
              </div>

              <div className="mt-3">
                  <button id="continue_button" type="button" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 mb-1 text-center inline-flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      <span className="mobile-text">Select this destination</span>
                      <span>Select this destination and continue</span>
                      <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
                  </button>
              </div>
          </div>

      </div>


  </div>
      

  </section>

  <div id="overview_modal" aria-hidden="true">
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="city_about_heading">
          <button type="button" id="overview_modal_close" aria-label="Close overview">&times;</button>
          <div className="modal-body">
              <div id="overview_modal_content"></div>
          </div>
      </div>
  </div>
    <Script src="/search.js" />
    </div>
    
    
  );
}

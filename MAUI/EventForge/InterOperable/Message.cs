using Microsoft.JSInterop;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge
{
    public class Message
    {
        [JSInvokable]
        public static async Task<string> GetMessage()
        {
            try
            {
                return "Message from maui";
            }
            catch (Exception ex) 
            {
                return $"Error something went wrong";
            }
        }
    }
}

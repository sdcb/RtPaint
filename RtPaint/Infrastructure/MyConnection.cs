using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace RtPaint.Infrastructure
{
    public class MyConnection : IDisposable
    {
        public MyConnection()
        {
            Debug.WriteLine("Creating MyConnection...");
        }

        public void Dispose()
        {
            Debug.WriteLine("Disposing MyConnection...");
        }
    }
}
